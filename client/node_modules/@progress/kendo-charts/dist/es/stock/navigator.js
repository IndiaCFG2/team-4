import NavigatorHint from './navigator-hint';
import { Selection, filterSeriesByType } from '../chart';
import { DRAG, DRAG_END, EQUALLY_SPACED_SERIES, ZOOM, ZOOM_END } from '../chart/constants';
import { DateCategoryAxis } from '../core';
import { addDuration, parseDate, toDate, toTime } from '../date-utils';
import { Class, deepExtend, defined, getTemplate, InstanceObserver, last, limitValue, valueOrDefault } from '../common';
import { NAVIGATOR_AXIS, NAVIGATOR_PANE } from './constants';

var ZOOM_ACCELERATION = 3;

var Navigator = (function (Class) {
    function Navigator(chart) {
        var obj;

        Class.call(this);

        this.chart = chart;
        var options = this.options = deepExtend({}, this.options, chart.options.navigator);
        var select = options.select;
        if (select) {
            select.from = this.parseDate(select.from);
            select.to = this.parseDate(select.to);
        }

        if (!defined(options.hint.visible)) {
            options.hint.visible = options.visible;
        }

        this.chartObserver = new InstanceObserver(this, ( obj = {}, obj[DRAG] = '_drag', obj[DRAG_END] = '_dragEnd', obj[ZOOM] = '_zoom', obj[ZOOM_END] = '_zoomEnd', obj ));
        chart.addObserver(this.chartObserver);
    }

    if ( Class ) Navigator.__proto__ = Class;
    Navigator.prototype = Object.create( Class && Class.prototype );
    Navigator.prototype.constructor = Navigator;

    Navigator.prototype.parseDate = function parseDate$1 (value) {
        return parseDate(this.chart.chartService.intl, value);
    };

    Navigator.prototype.clean = function clean () {
        if (this.selection) {
            this.selection.destroy();
            this.selection = null;
        }

        if (this.hint) {
            this.hint.destroy();
            this.hint = null;
        }
    };

    Navigator.prototype.destroy = function destroy () {
        if (this.chart) {
            this.chart.removeObserver(this.chartObserver);
            delete this.chart;
        }

        this.clean();
    };

    Navigator.prototype.redraw = function redraw () {
        this._redrawSelf();
        this.initSelection();
    };

    Navigator.prototype.initSelection = function initSelection () {
        var ref = this;
        var chart = ref.chart;
        var options = ref.options;
        var axis = this.mainAxis();
        var ref$1 = axis.roundedRange();
        var min = ref$1.min;
        var max = ref$1.max;
        var ref$2 = options.select;
        var from = ref$2.from;
        var to = ref$2.to;
        var mousewheel = ref$2.mousewheel;
        var axisClone = clone(axis);

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
    };

    Navigator.prototype.setRange = function setRange () {
        var plotArea = this.chart._createPlotArea(true);
        var axis = plotArea.namedCategoryAxes[NAVIGATOR_AXIS];

        var ref = axis.roundedRange();
        var min = ref.min;
        var max = ref.max;

        var select = this.options.select || {};
        var from = select.from || min;
        if (from < min) {
            from = min;
        }

        var to = select.to || max;
        if (to > max) {
            to = max;
        }

        this.options.select = deepExtend({}, select, {
            from: from,
            to: to
        });

        this.filterAxes();
    };

    Navigator.prototype._redrawSelf = function _redrawSelf (silent) {
        var plotArea = this.chart._plotArea;

        if (plotArea) {
            plotArea.redraw(last(plotArea.panes), silent);
        }
    };

    Navigator.prototype.redrawSlaves = function redrawSlaves () {
        var chart = this.chart;
        var plotArea = chart._plotArea;
        var slavePanes = plotArea.panes.slice(0, -1);

        // Update the original series and categoryAxis before partial refresh.
        plotArea.srcSeries = chart.options.series;
        plotArea.options.categoryAxis = chart.options.categoryAxis;
        plotArea.clearSeriesPointsCache();

        plotArea.redraw(slavePanes);
    };

    Navigator.prototype._drag = function _drag (e) {
        var ref = this;
        var chart = ref.chart;
        var selection = ref.selection;
        var coords = chart._eventCoordinates(e.originalEvent);
        var navigatorAxis = this.mainAxis();
        var naviRange = navigatorAxis.roundedRange();
        var inNavigator = navigatorAxis.pane.box.containsPoint(coords);
        var axis = chart._plotArea.categoryAxis;
        var range = e.axisRanges[axis.options.name];
        var select = this.options.select;
        var duration;

        if (!range || inNavigator || !selection) {
            return;
        }

        if (select.from && select.to) {
            duration = toTime(select.to) - toTime(select.from);
        } else {
            duration = toTime(selection.options.to) - toTime(selection.options.from);
        }

        var from = toDate(limitValue(
            toTime(range.min),
            naviRange.min, toTime(naviRange.max) - duration
        ));

        var to = toDate(limitValue(
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
    };

    Navigator.prototype._dragEnd = function _dragEnd () {
        this.filterAxes();
        this.filter();
        this.redrawSlaves();

        if (this.hint) {
            this.hint.hide();
        }
    };

    Navigator.prototype.readSelection = function readSelection () {
        var ref = this;
        var ref_selection_options = ref.selection.options;
        var from = ref_selection_options.from;
        var to = ref_selection_options.to;
        var select = ref.options.select;

        select.from = from;
        select.to = to;
    };

    Navigator.prototype.filterAxes = function filterAxes () {
        var ref = this;
        var select = ref.options.select; if ( select === void 0 ) select = { };
        var chart = ref.chart;
        var allAxes = chart.options.categoryAxis;
        var from = select.from;
        var to = select.to;

        for (var idx = 0; idx < allAxes.length; idx++) {
            var axis = allAxes[idx];
            if (axis.pane !== NAVIGATOR_PANE) {
                axis.min = from;
                axis.max = to;
            }
        }
    };

    Navigator.prototype.filter = function filter () {
        var ref = this;
        var chart = ref.chart;
        var select = ref.options.select;

        if (!chart.requiresHandlers([ "navigatorFilter" ])) {
            return;
        }

        var mainAxis = this.mainAxis();
        var args = {
            from: select.from,
            to: select.to
        };

        if (mainAxis.options.type !== 'category') {
            var axisOptions = new DateCategoryAxis(deepExtend({
                baseUnit: "fit"
            }, chart.options.categoryAxis[0], {
                categories: [ select.from, select.to ]
            }), chart.chartService).options;

            args.from = addDuration(axisOptions.min, -axisOptions.baseUnitStep, axisOptions.baseUnit);
            args.to = addDuration(axisOptions.max, axisOptions.baseUnitStep, axisOptions.baseUnit);
        }

        this.chart.trigger("navigatorFilter", args);
    };

    Navigator.prototype._zoom = function _zoom (e) {
        var ref = this;
        var axis = ref.chart._plotArea.categoryAxis;
        var selection = ref.selection;
        var ref_options = ref.options;
        var select = ref_options.select;
        var liveDrag = ref_options.liveDrag;
        var mainAxis = this.mainAxis();
        var delta = e.delta;

        if (!selection) {
            return;
        }

        var fromIx = mainAxis.categoryIndex(selection.options.from);
        var toIx = mainAxis.categoryIndex(selection.options.to);

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
    };

    Navigator.prototype._zoomEnd = function _zoomEnd (e) {
        this._dragEnd(e);
    };

    Navigator.prototype.showHint = function showHint (from, to) {
        var plotArea = this.chart._plotArea;

        if (this.hint) {
            this.hint.show(from, to, plotArea.backgroundBox());
        }
    };

    Navigator.prototype._selectStart = function _selectStart (e) {
        return this.chart._selectStart(e);
    };

    Navigator.prototype._select = function _select (e) {
        this.showHint(e.from, e.to);

        return this.chart._select(e);
    };

    Navigator.prototype._selectEnd = function _selectEnd (e) {
        if (this.hint) {
            this.hint.hide();
        }

        this.readSelection();
        this.filterAxes();
        this.filter();
        this.redrawSlaves();

        return this.chart._selectEnd(e);
    };

    Navigator.prototype.mainAxis = function mainAxis () {
        var plotArea = this.chart._plotArea;

        if (plotArea) {
            return plotArea.namedCategoryAxes[NAVIGATOR_AXIS];
        }
    };

    Navigator.prototype.select = function select (from, to) {
        var select = this.options.select;

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
    };

    Navigator.setup = function setup (options, themeOptions) {
        if ( options === void 0 ) options = {};
        if ( themeOptions === void 0 ) themeOptions = {};

        if (options.__navi) {
            return;
        }
        options.__navi = true;

        var naviOptions = deepExtend({}, themeOptions.navigator, options.navigator);
        var panes = options.panes = [].concat(options.panes);
        var paneOptions = deepExtend({}, naviOptions.pane, { name: NAVIGATOR_PANE });

        if (!naviOptions.visible) {
            paneOptions.visible = false;
            paneOptions.height = 0.1;
        }

        panes.push(paneOptions);

        Navigator.attachAxes(options, naviOptions);
        Navigator.attachSeries(options, naviOptions, themeOptions);
    };

    Navigator.attachAxes = function attachAxes (options, naviOptions) {
        var series = naviOptions.series || [];
        var categoryAxes = options.categoryAxis = [].concat(options.categoryAxis);
        var valueAxes = options.valueAxis = [].concat(options.valueAxis);

        var equallySpacedSeries = filterSeriesByType(series, EQUALLY_SPACED_SERIES);
        var justifyAxis = equallySpacedSeries.length === 0;

        var base = deepExtend({
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
        var user = naviOptions.categoryAxis;

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
    };

    Navigator.attachSeries = function attachSeries (options, naviOptions, themeOptions) {
        var series = options.series = options.series || [];
        var navigatorSeries = [].concat(naviOptions.series || []);
        var seriesColors = themeOptions.seriesColors;
        var defaults = naviOptions.seriesDefaults;

        for (var idx = 0; idx < navigatorSeries.length; idx++) {
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
    };

    return Navigator;
}(Class));

function ClonedObject() { }
function clone(obj) {
    ClonedObject.prototype = obj;
    return new ClonedObject();
}

export default Navigator;
