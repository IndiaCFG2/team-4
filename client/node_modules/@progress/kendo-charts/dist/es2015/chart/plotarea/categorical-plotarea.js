import PlotAreaBase from './plotarea-base';
import AxisGroupRangeTracker from '../axis-group-range-tracker';
import PlotAreaEventsMixin from '../mixins/plotarea-events-mixin';
import SeriesAggregator from '../aggregates/series-aggregator';
import DefaultAggregates from '../aggregates/default-aggregates';
import SeriesBinder from '../series-binder';
import BarChart from '../bar-chart/bar-chart';
import RangeBarChart from '../range-bar-chart/range-bar-chart';
import BulletChart from '../bullet-chart/bullet-chart';
import LineChart from '../line-chart/line-chart';
import AreaChart from '../area-chart/area-chart';
import RangeAreaChart from '../range-area-chart/range-area-chart';
import OHLCChart from '../ohlc-chart/ohlc-chart';
import CandlestickChart from '../candlestick-chart/candlestick-chart';
import BoxPlotChart from '../box-plot-chart/box-plot-chart';
import WaterfallChart from '../waterfall-chart/waterfall-chart';

import { CategoryAxis, DateCategoryAxis, NumericAxis, LogarithmicAxis, Point } from '../../core';

import { appendIfNotNull, categoriesCount, createOutOfRangePoints, equalsIgnoreCase, filterSeriesByType,
    getDateField, getField, isDateAxis, singleItemOrArray } from '../utils';

import { BAR, COLUMN, BULLET, VERTICAL_BULLET, LINE, VERTICAL_LINE, AREA, VERTICAL_AREA,
    RANGE_AREA, VERTICAL_RANGE_AREA, RANGE_COLUMN, RANGE_BAR, WATERFALL, HORIZONTAL_WATERFALL,
    BOX_PLOT, VERTICAL_BOX_PLOT, OHLC, CANDLESTICK, LOGARITHMIC, STEP, EQUALLY_SPACED_SERIES } from '../constants';

import { DATE, MAX_VALUE } from '../../common/constants';
import { setDefaultOptions, inArray, isNumber, deepExtend, defined, eventElement, grep } from '../../common';

const AREA_SERIES = [ AREA, VERTICAL_AREA, RANGE_AREA, VERTICAL_RANGE_AREA ];
const OUT_OF_RANGE_SERIES = [ LINE, VERTICAL_LINE ].concat(AREA_SERIES);

class CategoricalPlotArea extends PlotAreaBase {

    initFields(series) {
        this.namedCategoryAxes = {};
        this.namedValueAxes = {};
        this.valueAxisRangeTracker = new AxisGroupRangeTracker();

        if (series.length > 0) {
            this.invertAxes = inArray(
                series[0].type, [ BAR, BULLET, VERTICAL_LINE, VERTICAL_AREA, VERTICAL_RANGE_AREA,
                                 RANGE_BAR, HORIZONTAL_WATERFALL, VERTICAL_BOX_PLOT ]
            );

            for (let i = 0; i < series.length; i++) {
                const stack = series[i].stack;
                if (stack && stack.type === "100%") {
                    this.stack100 = true;
                    break;
                }
            }
        }

    }

    render(panes = this.panes) {
        this.createCategoryAxes(panes);
        this.aggregateCategories(panes);
        this.createCategoryAxesLabels(panes);
        this.createCharts(panes);
        this.createValueAxes(panes);
    }

    removeAxis(axis) {
        const axisName = axis.options.name;

        super.removeAxis(axis);

        if (axis instanceof CategoryAxis) {
            delete this.namedCategoryAxes[axisName];
        } else {
            this.valueAxisRangeTracker.reset(axisName);
            delete this.namedValueAxes[axisName];
        }

        if (axis === this.categoryAxis) {
            delete this.categoryAxis;
        }

        if (axis === this.valueAxis) {
            delete this.valueAxis;
        }
    }

    createCharts(panes) {
        const seriesByPane = this.groupSeriesByPane();

        for (let i = 0; i < panes.length; i++) {
            const pane = panes[i];
            const paneSeries = seriesByPane[pane.options.name || "default"] || [];
            this.addToLegend(paneSeries);

            const visibleSeries = this.filterVisibleSeries(paneSeries);
            if (!visibleSeries) {
                continue;
            }

            const groups = this.groupSeriesByCategoryAxis(visibleSeries);
            for (let groupIx = 0; groupIx < groups.length; groupIx++) {
                this.createChartGroup(groups[groupIx], pane);
            }
        }
    }

    createChartGroup(series, pane) {
        this.createAreaChart(
            filterSeriesByType(series, [ AREA, VERTICAL_AREA ]), pane
        );

        this.createRangeAreaChart(
            filterSeriesByType(series, [ RANGE_AREA, VERTICAL_RANGE_AREA ]), pane
        );

        this.createBarChart(
            filterSeriesByType(series, [ COLUMN, BAR ]), pane
        );

        this.createRangeBarChart(
            filterSeriesByType(series, [ RANGE_COLUMN, RANGE_BAR ]), pane
        );

        this.createBulletChart(
            filterSeriesByType(series, [ BULLET, VERTICAL_BULLET ]), pane
        );

        this.createCandlestickChart(
            filterSeriesByType(series, CANDLESTICK), pane
        );

        this.createBoxPlotChart(
            filterSeriesByType(series, [ BOX_PLOT, VERTICAL_BOX_PLOT ]), pane
        );

        this.createOHLCChart(
            filterSeriesByType(series, OHLC), pane
        );

        this.createWaterfallChart(
            filterSeriesByType(series, [ WATERFALL, HORIZONTAL_WATERFALL ]), pane
        );

        this.createLineChart(
            filterSeriesByType(series, [ LINE, VERTICAL_LINE ]), pane
        );
    }

    aggregateCategories(panes) {
        const series = this.srcSeries || this.series;
        const processedSeries = [];
        this._currentPointsCache = {};
        this._seriesPointsCache = this._seriesPointsCache || {};

        for (let i = 0; i < series.length; i++) {
            let currentSeries = series[i];
            const categoryAxis = this.seriesCategoryAxis(currentSeries);
            const axisPane = this.findPane(categoryAxis.options.pane);
            const dateAxis = equalsIgnoreCase(categoryAxis.options.type, DATE);

            if ((dateAxis || currentSeries.categoryField) && inArray(axisPane, panes)) {
                currentSeries = this.aggregateSeries(currentSeries, categoryAxis);
            } else {
                currentSeries = this.filterSeries(currentSeries, categoryAxis);
            }

            processedSeries.push(currentSeries);
        }

        this._seriesPointsCache = this._currentPointsCache;
        this._currentPointsCache = null;

        this.srcSeries = series;
        this.series = processedSeries;
    }

    filterSeries(series, categoryAxis) {
        const dataLength = (series.data || {}).length;
        categoryAxis._seriesMax = Math.max(categoryAxis._seriesMax || 0, dataLength);

        if (!(isNumber(categoryAxis.options.min) || isNumber(categoryAxis.options.max))) {
            return series;
        }

        const range = categoryAxis.currentRangeIndices();
        const outOfRangePoints = inArray(series.type, OUT_OF_RANGE_SERIES);
        const currentSeries = deepExtend({}, series);

        currentSeries.data = (currentSeries.data || []).slice(range.min, range.max + 1);

        if (outOfRangePoints) {
            createOutOfRangePoints(currentSeries, range, dataLength, (idx) => ({
                item: series.data[idx],
                category: categoryAxis.categoryAt(idx, true),
                categoryIx: idx - range.min
            }), (idx) => defined(series.data[idx]));
        }

        return currentSeries;
    }

    clearSeriesPointsCache() {
        this._seriesPointsCache = {};
    }

    seriesSourcePoints(series, categoryAxis) {
        const key = `${ series.index };${ categoryAxis.categoriesHash() }`;
        if (this._seriesPointsCache[key]) {
            this._currentPointsCache[key] = this._seriesPointsCache[key];
            return this._seriesPointsCache[key];
        }

        const axisOptions = categoryAxis.options;
        const srcCategories = axisOptions.srcCategories;
        const dateAxis = equalsIgnoreCase(axisOptions.type, DATE);
        const srcData = series.data;
        const getFn = dateAxis ? getDateField : getField;
        const result = [];
        if (!dateAxis) {
            categoryAxis.mapCategories();//fixes major performance issue caused by searching for the index for large data
        }

        for (let idx = 0; idx < srcData.length; idx++) {
            let category;
            if (series.categoryField) {
                category = getFn(series.categoryField, srcData[idx], this.chartService.intl);
            } else {
                category = srcCategories[idx];
            }

            if (defined(category) && category !== null) {
                const categoryIx = categoryAxis.totalIndex(category);
                result[categoryIx] = result[categoryIx] || { items: [], category: category };
                result[categoryIx].items.push(idx);
            }
        }

        this._currentPointsCache[key] = result;

        return result;
    }

    aggregateSeries(series, categoryAxis) {
        const srcData = series.data;
        if (!srcData.length) {
            return series;
        }

        const srcPoints = this.seriesSourcePoints(series, categoryAxis);
        const result = deepExtend({}, series);
        const aggregator = new SeriesAggregator(deepExtend({}, series), SeriesBinder.current, DefaultAggregates.current);
        const data = result.data = [];
        const dataItems = categoryAxis.options.dataItems || [];

        const range = categoryAxis.currentRangeIndices();
        const categoryItem = (idx) => {
            const categoryIdx = idx - range.min;
            let point = srcPoints[idx];
            if (!point) {
                point = srcPoints[idx] = {};
            }

            point.categoryIx = categoryIdx;

            if (!point.item) {
                const category = categoryAxis.categoryAt(idx, true);
                point.category = category;
                point.item = aggregator.aggregatePoints(point.items, category);
            }

            return point;
        };

        for (let idx = range.min; idx <= range.max; idx++) {
            const point = categoryItem(idx);
            data[point.categoryIx] = point.item;

            if (point.items && point.items.length) {
                dataItems[point.categoryIx] = point.item;
            }
        }

        if (inArray(result.type, OUT_OF_RANGE_SERIES)) {
            createOutOfRangePoints(result, range, categoryAxis.totalCount(), categoryItem, (idx) => srcPoints[idx]);
        }

        categoryAxis.options.dataItems = dataItems;

        return result;
    }

    appendChart(chart, pane) {
        const series = chart.options.series;
        const categoryAxis = this.seriesCategoryAxis(series[0]);
        let categories = categoryAxis.options.categories;
        let categoriesToAdd = Math.max(0, categoriesCount(series) - categories.length);

        if (categoriesToAdd > 0) {//consider setting an option to axis instead of adding fake categories
            categories = categoryAxis.options.categories = categoryAxis.options.categories.slice(0);
            while (categoriesToAdd--) {
                categories.push("");
            }
        }

        this.valueAxisRangeTracker.update(chart.valueAxisRanges);

        super.appendChart(chart, pane);
    }

    // TODO: Refactor, optionally use series.pane option
    seriesPaneName(series) {
        const options = this.options;
        const axisName = series.axis;
        const axisOptions = [].concat(options.valueAxis);
        const axis = grep(axisOptions, function(a) { return a.name === axisName; })[0];
        const panes = options.panes || [ {} ];
        const defaultPaneName = (panes[0] || {}).name || "default";
        const paneName = (axis || {}).pane || defaultPaneName;

        return paneName;
    }

    seriesCategoryAxis(series) {
        const axisName = series.categoryAxis;
        const axis = axisName ? this.namedCategoryAxes[axisName] : this.categoryAxis;

        if (!axis) {
            throw new Error("Unable to locate category axis with name " + axisName);
        }

        return axis;
    }

    stackableChartOptions(firstSeries, pane) {
        const stack = firstSeries.stack;
        const isStacked100 = stack && stack.type === "100%";
        const clip = pane.options.clip;

        return {
            isStacked: stack,
            isStacked100: isStacked100,
            clip: clip
        };
    }

    groupSeriesByCategoryAxis(series) {
        const categoryAxes = [];
        const unique = {};
        for (let idx = 0; idx < series.length; idx++) {
            const name = series[idx].categoryAxis || "$$default$$";
            if (!unique.hasOwnProperty(name)) {
                unique[name] = true;
                categoryAxes.push(name);
            }
        }

        const groups = [];
        for (let axisIx = 0; axisIx < categoryAxes.length; axisIx++) {
            const axis = categoryAxes[axisIx];
            const axisSeries = groupSeries(series, axis, axisIx);
            if (axisSeries.length === 0) {
                continue;
            }

            groups.push(axisSeries);
        }

        return groups;
    }

    createBarChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const barChart = new BarChart(this, Object.assign({
            series: series,
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            spacing: firstSeries.spacing
        }, this.stackableChartOptions(firstSeries, pane)));

        this.appendChart(barChart, pane);
    }

    createRangeBarChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const rangeColumnChart = new RangeBarChart(this, {
            series: series,
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            spacing: firstSeries.spacing
        });

        this.appendChart(rangeColumnChart, pane);
    }

    createBulletChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const bulletChart = new BulletChart(this, {
            series: series,
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            spacing: firstSeries.spacing,
            clip: pane.options.clip
        });

        this.appendChart(bulletChart, pane);
    }

    createLineChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const lineChart = new LineChart(this, Object.assign({
            invertAxes: this.invertAxes,
            series: series
        }, this.stackableChartOptions(firstSeries, pane)));

        this.appendChart(lineChart, pane);
    }

    createAreaChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const areaChart = new AreaChart(this, Object.assign({
            invertAxes: this.invertAxes,
            series: series
        }, this.stackableChartOptions(firstSeries, pane)));

        this.appendChart(areaChart, pane);
    }

    createRangeAreaChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const rangeAreaChart = new RangeAreaChart(this, {
            invertAxes: this.invertAxes,
            series: series,
            clip: pane.options.clip
        });

        this.appendChart(rangeAreaChart, pane);
    }

    createOHLCChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const chart = new OHLCChart(this, {
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            series: series,
            spacing: firstSeries.spacing,
            clip: pane.options.clip
        });

        this.appendChart(chart, pane);
    }

    createCandlestickChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const chart = new CandlestickChart(this, {
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            series: series,
            spacing: firstSeries.spacing,
            clip: pane.options.clip
        });

        this.appendChart(chart, pane);
    }

    createBoxPlotChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const chart = new BoxPlotChart(this, {
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            series: series,
            spacing: firstSeries.spacing,
            clip: pane.options.clip
        });

        this.appendChart(chart, pane);
    }

    createWaterfallChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const waterfallChart = new WaterfallChart(this, {
            series: series,
            invertAxes: this.invertAxes,
            gap: firstSeries.gap,
            spacing: firstSeries.spacing
        });

        this.appendChart(waterfallChart, pane);
    }

    axisRequiresRounding(categoryAxisName, categoryAxisIndex) {
        const centeredSeries = filterSeriesByType(this.series, EQUALLY_SPACED_SERIES);

        for (let seriesIx = 0; seriesIx < this.series.length; seriesIx++) {
            const currentSeries = this.series[seriesIx];
            if (inArray(currentSeries.type, AREA_SERIES)) {
                const line = currentSeries.line;
                if (line && line.style === STEP) {
                    centeredSeries.push(currentSeries);
                }
            }
        }

        for (let seriesIx = 0; seriesIx < centeredSeries.length; seriesIx++) {
            const seriesAxis = centeredSeries[seriesIx].categoryAxis || "";
            if (seriesAxis === categoryAxisName || (!seriesAxis && categoryAxisIndex === 0)) {
                return true;
            }
        }
    }

    aggregatedAxis(categoryAxisName, categoryAxisIndex) {
        const series = this.series;

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const seriesAxis = series[seriesIx].categoryAxis || "";
            if ((seriesAxis === categoryAxisName || (!seriesAxis && categoryAxisIndex === 0)) && series[seriesIx].categoryField) {
                return true;
            }
        }
    }

    createCategoryAxesLabels() {
        const axes = this.axes;
        for (let i = 0; i < axes.length; i++) {
            if (axes[i] instanceof CategoryAxis) {
                axes[i].createLabels();
            }
        }
    }

    createCategoryAxes(panes) {
        const invertAxes = this.invertAxes;
        const definitions = [].concat(this.options.categoryAxis);
        const axes = [];

        for (let i = 0; i < definitions.length; i++) {
            let axisOptions = definitions[i];
            const axisPane = this.findPane(axisOptions.pane);

            if (inArray(axisPane, panes)) {
                const { name, categories = [] } = axisOptions;
                axisOptions = deepExtend({
                    vertical: invertAxes,
                    reverse: !invertAxes && this.chartService.rtl,
                    axisCrossingValue: invertAxes ? MAX_VALUE : 0
                }, axisOptions);

                if (!defined(axisOptions.justified)) {
                    axisOptions.justified = this.isJustified();
                }

                if (this.axisRequiresRounding(name, i)) {
                    axisOptions.justified = false;
                }

                let categoryAxis;

                if (isDateAxis(axisOptions, categories[0])) {
                    categoryAxis = new DateCategoryAxis(axisOptions, this.chartService);
                } else {
                    categoryAxis = new CategoryAxis(axisOptions, this.chartService);
                }

                definitions[i].categories = categoryAxis.options.srcCategories;

                if (name) {
                    if (this.namedCategoryAxes[name]) {
                        throw new Error(`Category axis with name ${ name } is already defined`);
                    }
                    this.namedCategoryAxes[name] = categoryAxis;
                }

                categoryAxis.axisIndex = i;
                axes.push(categoryAxis);
                this.appendAxis(categoryAxis);
            }
        }

        const primaryAxis = this.categoryAxis || axes[0];
        this.categoryAxis = primaryAxis;

        if (invertAxes) {
            this.axisY = primaryAxis;
        } else {
            this.axisX = primaryAxis;
        }
    }

    isJustified() {
        const series = this.series;

        for (let i = 0; i < series.length; i++) {
            const currentSeries = series[i];
            if (!inArray(currentSeries.type, AREA_SERIES)) {
                return false;
            }
        }

        return true;
    }

    createValueAxes(panes) {
        const tracker = this.valueAxisRangeTracker;
        const defaultRange = tracker.query();
        const definitions = [].concat(this.options.valueAxis);
        const invertAxes = this.invertAxes;
        const baseOptions = { vertical: !invertAxes, reverse: invertAxes && this.chartService.rtl };
        const axes = [];

        if (this.stack100) {
            baseOptions.roundToMajorUnit = false;
            baseOptions.labels = { format: "P0" };
        }

        for (let i = 0; i < definitions.length; i++) {
            const axisOptions = definitions[i];
            const axisPane = this.findPane(axisOptions.pane);

            if (inArray(axisPane, panes)) {
                const name = axisOptions.name;
                const defaultAxisRange = equalsIgnoreCase(axisOptions.type, LOGARITHMIC) ? { min: 0.1, max: 1 } : { min: 0, max: 1 };
                const range = tracker.query(name) || defaultRange || defaultAxisRange;

                if (i === 0 && range && defaultRange) {
                    range.min = Math.min(range.min, defaultRange.min);
                    range.max = Math.max(range.max, defaultRange.max);
                }

                let axisType;
                if (equalsIgnoreCase(axisOptions.type, LOGARITHMIC)) {
                    axisType = LogarithmicAxis;
                } else {
                    axisType = NumericAxis;
                }

                const valueAxis = new axisType(range.min, range.max,
                    deepExtend({}, baseOptions, axisOptions),
                    this.chartService
                );

                if (name) {
                    if (this.namedValueAxes[name]) {
                        throw new Error(`Value axis with name ${ name } is already defined`);
                    }
                    this.namedValueAxes[name] = valueAxis;
                }
                valueAxis.axisIndex = i;

                axes.push(valueAxis);
                this.appendAxis(valueAxis);
            }
        }

        const primaryAxis = this.valueAxis || axes[0];
        this.valueAxis = primaryAxis;

        if (invertAxes) {
            this.axisX = primaryAxis;
        } else {
            this.axisY = primaryAxis;
        }
    }

    _dispatchEvent(chart, e, eventType) {
        const coords = chart._eventCoordinates(e);
        const point = new Point(coords.x, coords.y);
        const pane = this.pointPane(point);
        const categories = [];
        const values = [];

        if (!pane) {
            return;
        }

        const allAxes = pane.axes;
        for (let i = 0; i < allAxes.length; i++) {
            const axis = allAxes[i];
            if (axis.getValue) {
                appendIfNotNull(values, axis.getValue(point));
            } else {
                appendIfNotNull(categories, axis.getCategory(point));
            }
        }

        if (categories.length === 0) {
            appendIfNotNull(categories, this.categoryAxis.getCategory(point));
        }

        if (categories.length > 0 && values.length > 0) {
            chart.trigger(eventType, {
                element: eventElement(e),
                originalEvent: e,
                category: singleItemOrArray(categories),
                value: singleItemOrArray(values)
            });
        }
    }

    pointPane(point) {
        const panes = this.panes;

        for (let i = 0; i < panes.length; i++) {
            const currentPane = panes[i];
            if (currentPane.contentBox.containsPoint(point)) {
                return currentPane;
            }
        }
    }

    updateAxisOptions(axis, options) {
        updateAxisOptions(this.options, axis, options);
        updateAxisOptions(this.originalOptions, axis, options);
    }
}

function updateAxisOptions(targetOptions, axis, options) {
    const axesOptions = axis instanceof CategoryAxis ? [].concat(targetOptions.categoryAxis) : [].concat(targetOptions.valueAxis);
    deepExtend(axesOptions[axis.axisIndex], options);
}

function groupSeries(series, axis, axisIx) {
    return grep(series, function(s) {
        return (axisIx === 0 && !s.categoryAxis) || (s.categoryAxis === axis);
    });
}

setDefaultOptions(CategoricalPlotArea, {
    categoryAxis: {},
    valueAxis: {}
});

deepExtend(CategoricalPlotArea.prototype, PlotAreaEventsMixin);

export default CategoricalPlotArea;