import PlotAreaBase from './plotarea-base';
import AxisGroupRangeTracker from '../axis-group-range-tracker';
import PlotAreaEventsMixin from '../mixins/plotarea-events-mixin';
import ScatterChart from '../scatter-charts/scatter-chart';
import ScatterLineChart from '../scatter-charts/scatter-line-chart';
import BubbleChart from '../bubble-chart/bubble-chart';
import SeriesBinder from '../series-binder';

import { NumericAxis, LogarithmicAxis, DateValueAxis, Point } from '../../core';

import filterSeriesByType from '../utils/filter-series-by-type';
import equalsIgnoreCase from '../utils/equals-ignore-case';
import singleItemOrArray from '../utils/single-item-or-array';

import { SCATTER, SCATTER_LINE, BUBBLE, LOGARITHMIC } from '../constants';

import { DATE } from '../../common/constants';
import { deepExtend, eventElement, grep, inArray, setDefaultOptions } from '../../common';

class XYPlotArea extends PlotAreaBase {
    initFields() {
        this.namedXAxes = {};
        this.namedYAxes = {};

        this.xAxisRangeTracker = new AxisGroupRangeTracker();
        this.yAxisRangeTracker = new AxisGroupRangeTracker();
    }

    render(panes = this.panes) {
        const seriesByPane = this.groupSeriesByPane();

        for (let i = 0; i < panes.length; i++) {
            const pane = panes[i];
            const paneSeries = seriesByPane[pane.options.name || "default"] || [];
            this.addToLegend(paneSeries);
            const filteredSeries = this.filterVisibleSeries(paneSeries);

            if (!filteredSeries) {
                continue;
            }

            this.createScatterChart(
                filterSeriesByType(filteredSeries, SCATTER),
                pane
            );

            this.createScatterLineChart(
                filterSeriesByType(filteredSeries, SCATTER_LINE),
                pane
            );

            this.createBubbleChart(
                filterSeriesByType(filteredSeries, BUBBLE),
                pane
            );
        }

        this.createAxes(panes);
    }

    appendChart(chart, pane) {
        this.xAxisRangeTracker.update(chart.xAxisRanges);
        this.yAxisRangeTracker.update(chart.yAxisRanges);

        super.appendChart(chart, pane);
    }

    removeAxis(axis) {
        const axisName = axis.options.name;

        super.removeAxis(axis);

        if (axis.options.vertical) {
            this.yAxisRangeTracker.reset(axisName);
            delete this.namedYAxes[axisName];
        } else {
            this.xAxisRangeTracker.reset(axisName);
            delete this.namedXAxes[axisName];
        }

        if (axis === this.axisX) {
            delete this.axisX;
        }

        if (axis === this.axisY) {
            delete this.axisY;
        }
    }

    // TODO: Refactor, optionally use series.pane option
    seriesPaneName(series) {
        const options = this.options;
        const xAxisName = series.xAxis;
        const xAxisOptions = [].concat(options.xAxis);
        const xAxis = grep(xAxisOptions, function(a) { return a.name === xAxisName; })[0];
        const yAxisName = series.yAxis;
        const yAxisOptions = [].concat(options.yAxis);
        const yAxis = grep(yAxisOptions, function(a) { return a.name === yAxisName; })[0];
        const panes = options.panes || [ {} ];
        const defaultPaneName = panes[0].name || "default";
        const paneName = (xAxis || {}).pane || (yAxis || {}).pane || defaultPaneName;

        return paneName;
    }

    createScatterChart(series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new ScatterChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    }

    createScatterLineChart(series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new ScatterLineChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    }

    createBubbleChart(series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new BubbleChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    }

    createXYAxis(options, vertical, axisIndex) {
        const axisName = options.name;
        const namedAxes = vertical ? this.namedYAxes : this.namedXAxes;
        const tracker = vertical ? this.yAxisRangeTracker : this.xAxisRangeTracker;
        const axisOptions = deepExtend({ reverse: !vertical && this.chartService.rtl }, options, { vertical: vertical });
        const isLog = equalsIgnoreCase(axisOptions.type, LOGARITHMIC);
        const defaultRange = tracker.query();
        const defaultAxisRange = isLog ? { min: 0.1, max: 1 } : { min: 0, max: 1 };
        const range = tracker.query(axisName) || defaultRange || defaultAxisRange;
        const typeSamples = [ axisOptions.min, axisOptions.max ];
        const series = this.series;

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const currentSeries = series[seriesIx];
            const seriesAxisName = currentSeries[vertical ? "yAxis" : "xAxis"];
            if ((seriesAxisName === axisOptions.name) || (axisIndex === 0 && !seriesAxisName)) {
                const firstPointValue = SeriesBinder.current.bindPoint(currentSeries, 0).valueFields;
                typeSamples.push(firstPointValue[vertical ? "y" : "x"]);

                break;
            }
        }

        if (axisIndex === 0 && defaultRange) {
            range.min = Math.min(range.min, defaultRange.min);
            range.max = Math.max(range.max, defaultRange.max);
        }

        let inferredDate;

        for (let i = 0; i < typeSamples.length; i++) {
            if (typeSamples[i] instanceof Date) {
                inferredDate = true;
                break;
            }
        }

        let axisType;
        if (equalsIgnoreCase(axisOptions.type, DATE) || (!axisOptions.type && inferredDate)) {
            axisType = DateValueAxis;
        } else if (isLog) {
            axisType = LogarithmicAxis;
        } else {
            axisType = NumericAxis;
        }

        const axis = new axisType(range.min, range.max, axisOptions, this.chartService);
        axis.axisIndex = axisIndex;

        if (axisName) {
            if (namedAxes[axisName]) {
                throw new Error(`${ vertical ? "Y" : "X" } axis with name ${ axisName } is already defined`);
            }
            namedAxes[axisName] = axis;
        }

        this.appendAxis(axis);

        return axis;
    }

    createAxes(panes) {
        const options = this.options;
        const xAxesOptions = [].concat(options.xAxis);
        const xAxes = [];
        const yAxesOptions = [].concat(options.yAxis);
        const yAxes = [];

        for (let idx = 0; idx < xAxesOptions.length; idx++) {
            const axisPane = this.findPane(xAxesOptions[idx].pane);
            if (inArray(axisPane, panes)) {
                xAxes.push(this.createXYAxis(xAxesOptions[idx], false, idx));
            }
        }

        for (let idx = 0; idx < yAxesOptions.length; idx++) {
            const axisPane = this.findPane(yAxesOptions[idx].pane);
            if (inArray(axisPane, panes)) {
                yAxes.push(this.createXYAxis(yAxesOptions[idx], true, idx));
            }
        }

        this.axisX = this.axisX || xAxes[0];
        this.axisY = this.axisY || yAxes[0];
    }

    _dispatchEvent(chart, e, eventType) {
        const coords = chart._eventCoordinates(e);
        const point = new Point(coords.x, coords.y);
        const allAxes = this.axes;
        const length = allAxes.length;
        const xValues = [];
        const yValues = [];

        for (let i = 0; i < length; i++) {
            const axis = allAxes[i];
            const values = axis.options.vertical ? yValues : xValues;
            const currentValue = axis.getValue(point);
            if (currentValue !== null) {
                values.push(currentValue);
            }
        }

        if (xValues.length > 0 && yValues.length > 0) {
            chart.trigger(eventType, {
                element: eventElement(e),
                originalEvent: e,
                x: singleItemOrArray(xValues),
                y: singleItemOrArray(yValues)
            });
        }
    }

    updateAxisOptions(axis, options) {
        const vertical = axis.options.vertical;
        const axes = this.groupAxes(this.panes);
        const index = (vertical ? axes.y : axes.x).indexOf(axis);

        updateAxisOptions(this.options, index, vertical, options);
        updateAxisOptions(this.originalOptions, index, vertical, options);
    }
}

function updateAxisOptions(targetOptions, axisIndex, vertical, options) {
    const axisOptions = ([].concat(vertical ? targetOptions.yAxis : targetOptions.xAxis))[axisIndex];
    deepExtend(axisOptions, options);
}

setDefaultOptions(XYPlotArea, {
    xAxis: {},
    yAxis: {}
});

deepExtend(XYPlotArea.prototype, PlotAreaEventsMixin);

export default XYPlotArea;