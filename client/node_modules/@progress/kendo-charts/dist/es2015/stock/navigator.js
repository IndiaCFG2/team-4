import NavigatorHint from './navigator-hint';
import { Selection, filterSeriesByType } from '../chart';
import { DRAG, DRAG_END, EQUALLY_SPACED_SERIES, ZOOM, ZOOM_END } from '../chart/constants';
import { DateCategoryAxis } from '../core';
import { addDuration, parseDate, toDate, toTime } from '../date-utils';
import { Class, deepExtend, defined, getTemplate, InstanceObserver, last, limitValue, valueOrDefault } from '../common';
import { NAVIGATOR_AXIS, NAVIGATOR_PANE } from './constants';

const ZOOM_ACCELERATION = 3;

class Navigator extends Class {
    constructor(chart) {
        super();

        this.chart = chart;
        const options = this.options = deepExtend({}, this.options, chart.options.navigator);
        const select = options.select;
        if (select) {
            select.from = this.parseDate(select.from);
            select.to = this.parseDate(select.to);
        }

        if (!defined(options.hint.visible)) {
            options.hint.visible = options.visible;
        }

        this.chartObserver = new InstanceObserver(this, {
            [DRAG]: '_drag',
            [DRAG_END]: '_dragEnd',
            [ZOOM]: '_zoom',
            [ZOOM_END]: '_zoomEnd'
        });
        chart.addObserver(this.chartObserver);
    }

    parseDate(value) {
        return parseDate(this.chart.chartService.intl, value);
    }

    clean() {
        if (this.selection) {
            this.selection.destroy();
            this.selection = null;
        }

        if (this.hint) {
            this.hint.destroy();
            this.hint = null;
        }
    }

    destroy() {
        if (this.chart) {
            this.chart.removeObserver(this.chartObserver);
            delete this.chart;
        }

        this.clean();
    }

    redraw() {
        this._redrawSelf();
        this.initSelection();
    }

    initSelection() {
        const { chart, options } = this;
        const axis = this.mainAxis();
        const { min, max } = axis.roundedRange();
        const { from, to, mousewheel } = options.select;
        const axisClone = clone(axis);

        if (axis.categoriesCount() === 0) {
            return;
        }

        this.clean();

        // "Freeze" the selection axis position until the next redraw
        axisClone.box = axis.box;

        this.selection = new Selection(chart, axisClone, {
            min: min,
            max: max,
            from: from || min,
            to: to || max,
            mousewheel: valueOrDefault(mousewheel, { zoom: "left" }),
            visible: options.visible
        }, new InstanceObserver(this, {
            selectStart: '_selectStart',
            select: '_select',
            selectEnd: '_selectEnd'
        }));

        if (options.hint.visible) {
            this.hint = new NavigatorHint(chart.element, chart.chartService, {
                min: min,
                max: max,
                template: getTemplate(options.hint),
                format: options.hint.format
            });
        }
    }

    setRange() {
        const plotArea = this.chart._createPlotArea(true);
        const axis = plotArea.namedCategoryAxes[NAVIGATOR_AXIS];

        const { min, max } = axis.roundedRange();

        const select = this.options.select || {};
        let from = select.from || min;
        if (from < min) {
            from = min;
        }

        let to = select.to || max;
        if (to > max) {
            to = max;
        }

        this.options.select = deepExtend({}, select, {
            from: from,
            to: to
        });

        this.filterAxes();
    }

    _redrawSelf(silent) {
        const plotArea = this.chart._plotArea;

        if (plotArea) {
            plotArea.redraw(last(plotArea.panes), silent);
        }
    }

    redrawSlaves() {
        const chart = this.chart;
        const plotArea = chart._plotArea;
        const slavePanes = plotArea.panes.slice(0, -1);

        // Update the original series and categoryAxis before partial refresh.
        plotArea.srcSeries = chart.options.series;
        plotArea.options.categoryAxis = chart.options.categoryAxis;
        plotArea.clearSeriesPointsCache();

        plotArea.redraw(slavePanes);
    }

    _drag(e) {
        const { chart, selection } = this;
        const coords = chart._eventCoordinates(e.originalEvent);
        const navigatorAxis = this.mainAxis();
        const naviRange = navigatorAxis.roundedRange();
        const inNavigator = navigatorAxis.pane.box.containsPoint(coords);
        const axis = chart._plotArea.categoryAxis;
        const range = e.axisRanges[axis.options.name];
        const select = this.options.select;
        let duration;

        if (!range || inNavigator || !selection) {
            return;
        }

        if (select.from && select.to) {
            duration = toTime(select.to) - toTime(select.from);
        } else {
            duration = toTime(selection.options.to) - toTime(selection.options.from);
        }

        const from = toDate(limitValue(
            toTime(range.min),
            naviRange.min, toTime(naviRange.max) - duration
        ));

        const to = toDate(limitValue(
            toTime(from) + duration,
            toTime(naviRange.min) + duration, naviRange.max
        ));

        this.options.select = { from: from, to: to };

        if (this.options.liveDrag) {
            this.filterAxes();
            this.redrawSlaves();
        }

        selection.set(from, to);

        this.showHint(from, to);
    }

    _dragEnd() {
        this.filterAxes();
        this.filter();
        this.redrawSlaves();

        if (this.hint) {
            this.hint.hide();
        }
    }

    readSelection() {
        const { selection: { options: { from, to } }, options: { select } } = this;

        select.from = from;
        select.to = to;
    }

    filterAxes() {
        const { options: { select = { } }, chart } = this;
        const allAxes = chart.options.categoryAxis;
        const { from, to } = select;

        for (let idx = 0; idx < allAxes.length; idx++) {
            const axis = allAxes[idx];
            if (axis.pane !== NAVIGATOR_PANE) {
                axis.min = from;
                axis.max = to;
            }
        }
    }

    filter() {
        const { chart, options: { select } } = this;

        if (!chart.requiresHandlers([ "navigatorFilter" ])) {
            return;
        }

        const mainAxis = this.mainAxis();
        const args = {
            from: select.from,
            to: select.to
        };

        if (mainAxis.options.type !== 'category') {
            const axisOptions = new DateCategoryAxis(deepExtend({
                baseUnit: "fit"
            }, chart.options.categoryAxis[0], {
                categories: [ select.from, select.to ]
            }), chart.chartService).options;

            args.from = addDuration(axisOptions.min, -axisOptions.baseUnitStep, axisOptions.baseUnit);
            args.to = addDuration(axisOptions.max, axisOptions.baseUnitStep, axisOptions.baseUnit);
        }

        this.chart.trigger("navigatorFilter", args);
    }

    _zoom(e) {
        const { chart: { _plotArea: { categoryAxis: axis } }, selection, options: { select, liveDrag } } = this;
        const mainAxis = this.mainAxis();
        let delta = e.delta;

        if (!selection) {
            return;
        }

        const fromIx = mainAxis.categoryIndex(selection.options.from);
        const toIx = mainAxis.categoryIndex(selection.options.to);

        e.originalEvent.preventDefault();

        if (Math.abs(delta) > 1) {
            delta *= ZOOM_ACCELERATION;
        }

        if (toIx - fromIx > 1) {
            selection.expand(delta);
            this.readSelection();
        } else {
            axis.options.min = select.from;
            select.from = axis.scaleRange(-e.delta).min;
        }

        if (liveDrag) {
            this.filterAxes();
            this.redrawSlaves();
        }

        selection.set(select.from, select.to);

        this.showHint(this.options.select.from, this.options.select.to);
    }

    _zoomEnd(e) {
        this._dragEnd(e);
    }

    showHint(from, to) {
        const plotArea = this.chart._plotArea;

        if (this.hint) {
            this.hint.show(from, to, plotArea.backgroundBox());
        }
    }

    _selectStart(e) {
        return this.chart._selectStart(e);
    }

    _select(e) {
        this.showHint(e.from, e.to);

        return this.chart._select(e);
    }

    _selectEnd(e) {
        if (this.hint) {
            this.hint.hide();
        }

        this.readSelection();
        this.filterAxes();
        this.filter();
        this.redrawSlaves();

        return this.chart._selectEnd(e);
    }

    mainAxis() {
        const plotArea = this.chart._plotArea;

        if (plotArea) {
            return plotArea.namedCategoryAxes[NAVIGATOR_AXIS];
        }
    }

    select(from, to) {
        const select = this.options.select;

        if (from && to) {
            select.from = this.parseDate(from);
            select.to = this.parseDate(to);

            this.filterAxes();
            this.filter();
            this.redrawSlaves();

            this.selection.set(from, to);
        }

        return {
            from: select.from,
            to: select.to
        };
    }

    static setup(options = {}, themeOptions = {}) {
        if (options.__navi) {
            return;
        }
        options.__navi = true;

        const naviOptions = deepExtend({}, themeOptions.navigator, options.navigator);
        const panes = options.panes = [].concat(options.panes);
        const paneOptions = deepExtend({}, naviOptions.pane, { name: NAVIGATOR_PANE });

        if (!naviOptions.visible) {
            paneOptions.visible = false;
            paneOptions.height = 0.1;
        }

        panes.push(paneOptions);

        Navigator.attachAxes(options, naviOptions);
        Navigator.attachSeries(options, naviOptions, themeOptions);
    }

    static attachAxes(options, naviOptions) {
        const series = naviOptions.series || [];
        const categoryAxes = options.categoryAxis = [].concat(options.categoryAxis);
        const valueAxes = options.valueAxis = [].concat(options.valueAxis);

        const equallySpacedSeries = filterSeriesByType(series, EQUALLY_SPACED_SERIES);
        const justifyAxis = equallySpacedSeries.length === 0;

        const base = deepExtend({
            type: "date",
            pane: NAVIGATOR_PANE,
            roundToBaseUnit: !justifyAxis,
            justified: justifyAxis,
            _collapse: false,
            majorTicks: { visible: true },
            tooltip: { visible: false },
            labels: { step: 1 },
            autoBind: naviOptions.autoBindElements,
            autoBaseUnitSteps: {
                minutes: [ 1 ],
                hours: [ 1, 2 ],
                days: [ 1, 2 ],
                weeks: [],
                months: [ 1 ],
                years: [ 1 ]
            }
        });
        const user = naviOptions.categoryAxis;

        categoryAxes.push(
            deepExtend({}, base, {
                maxDateGroups: 200
            }, user, {
                name: NAVIGATOR_AXIS,
                title: null,
                baseUnit: "fit",
                baseUnitStep: "auto",
                labels: { visible: false },
                majorTicks: { visible: false }
            }), deepExtend({}, base, user, {
                name: NAVIGATOR_AXIS + "_labels",
                maxDateGroups: 20,
                baseUnitStep: "auto",
                labels: { position: "" },
                plotBands: [],
                autoBaseUnitSteps: {
                    minutes: []
                },
                _overlap: true
            }), deepExtend({}, base, user, {
                name: NAVIGATOR_AXIS + "_ticks",
                maxDateGroups: 200,
                majorTicks: {
                    width: 0.5
                },
                plotBands: [],
                title: null,
                labels: { visible: false, mirror: true },
                _overlap: true
            })
        );

        valueAxes.push(deepExtend({
            name: NAVIGATOR_AXIS,
            pane: NAVIGATOR_PANE,
            majorGridLines: {
                visible: false
            },
            visible: false
        }, naviOptions.valueAxis));
    }

    static attachSeries(options, naviOptions, themeOptions) {
        const series = options.series = options.series || [];
        const navigatorSeries = [].concat(naviOptions.series || []);
        const seriesColors = themeOptions.seriesColors;
        const defaults = naviOptions.seriesDefaults;

        for (let idx = 0; idx < navigatorSeries.length; idx++) {
            series.push(
                deepExtend({
                    color: seriesColors[idx % seriesColors.length],
                    categoryField: naviOptions.dateField,
                    visibleInLegend: false,
                    tooltip: {
                        visible: false
                    }
                }, defaults, navigatorSeries[idx], {
                    axis: NAVIGATOR_AXIS,
                    categoryAxis: NAVIGATOR_AXIS,
                    autoBind: naviOptions.autoBindElements
                })
            );
        }
    }
}

function ClonedObject() { }
function clone(obj) {
    ClonedObject.prototype = obj;
    return new ClonedObject();
}

export default Navigator;
