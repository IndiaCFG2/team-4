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

var XYPlotArea = (function (PlotAreaBase) {
    function XYPlotArea () {
        PlotAreaBase.apply(this, arguments);
    }

    if ( PlotAreaBase ) XYPlotArea.__proto__ = PlotAreaBase;
    XYPlotArea.prototype = Object.create( PlotAreaBase && PlotAreaBase.prototype );
    XYPlotArea.prototype.constructor = XYPlotArea;

    XYPlotArea.prototype.initFields = function initFields () {
        this.namedXAxes = {};
        this.namedYAxes = {};

        this.xAxisRangeTracker = new AxisGroupRangeTracker();
        this.yAxisRangeTracker = new AxisGroupRangeTracker();
    };

    XYPlotArea.prototype.render = function render (panes) {
        var this$1 = this;
        if ( panes === void 0 ) panes = this.panes;

        var seriesByPane = this.groupSeriesByPane();

        for (var i = 0; i < panes.length; i++) {
            var pane = panes[i];
            var paneSeries = seriesByPane[pane.options.name || "default"] || [];
            this$1.addToLegend(paneSeries);
            var filteredSeries = this$1.filterVisibleSeries(paneSeries);

            if (!filteredSeries) {
                continue;
            }

            this$1.createScatterChart(
                filterSeriesByType(filteredSeries, SCATTER),
                pane
            );

            this$1.createScatterLineChart(
                filterSeriesByType(filteredSeries, SCATTER_LINE),
                pane
            );

            this$1.createBubbleChart(
                filterSeriesByType(filteredSeries, BUBBLE),
                pane
            );
        }

        this.createAxes(panes);
    };

    XYPlotArea.prototype.appendChart = function appendChart (chart, pane) {
        this.xAxisRangeTracker.update(chart.xAxisRanges);
        this.yAxisRangeTracker.update(chart.yAxisRanges);

        PlotAreaBase.prototype.appendChart.call(this, chart, pane);
    };

    XYPlotArea.prototype.removeAxis = function removeAxis (axis) {
        var axisName = axis.options.name;

        PlotAreaBase.prototype.removeAxis.call(this, axis);

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
    };

    // TODO: Refactor, optionally use series.pane option
    XYPlotArea.prototype.seriesPaneName = function seriesPaneName (series) {
        var options = this.options;
        var xAxisName = series.xAxis;
        var xAxisOptions = [].concat(options.xAxis);
        var xAxis = grep(xAxisOptions, function(a) { return a.name === xAxisName; })[0];
        var yAxisName = series.yAxis;
        var yAxisOptions = [].concat(options.yAxis);
        var yAxis = grep(yAxisOptions, function(a) { return a.name === yAxisName; })[0];
        var panes = options.panes || [ {} ];
        var defaultPaneName = panes[0].name || "default";
        var paneName = (xAxis || {}).pane || (yAxis || {}).pane || defaultPaneName;

        return paneName;
    };

    XYPlotArea.prototype.createScatterChart = function createScatterChart (series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new ScatterChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    };

    XYPlotArea.prototype.createScatterLineChart = function createScatterLineChart (series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new ScatterLineChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    };

    XYPlotArea.prototype.createBubbleChart = function createBubbleChart (series, pane) {
        if (series.length > 0) {
            this.appendChart(
                new BubbleChart(this, { series: series, clip: pane.options.clip }),
                pane
            );
        }
    };

    XYPlotArea.prototype.createXYAxis = function createXYAxis (options, vertical, axisIndex) {
        var axisName = options.name;
        var namedAxes = vertical ? this.namedYAxes : this.namedXAxes;
        var tracker = vertical ? this.yAxisRangeTracker : this.xAxisRangeTracker;
        var axisOptions = deepExtend({ reverse: !vertical && this.chartService.rtl }, options, { vertical: vertical });
        var isLog = equalsIgnoreCase(axisOptions.type, LOGARITHMIC);
        var defaultRange = tracker.query();
        var defaultAxisRange = isLog ? { min: 0.1, max: 1 } : { min: 0, max: 1 };
        var range = tracker.query(axisName) || defaultRange || defaultAxisRange;
        var typeSamples = [ axisOptions.min, axisOptions.max ];
        var series = this.series;

        for (var seriesIx = 0; seriesIx < series.length; seriesIx++) {
            var currentSeries = series[seriesIx];
            var seriesAxisName = currentSeries[vertical ? "yAxis" : "xAxis"];
            if ((seriesAxisName === axisOptions.name) || (axisIndex === 0 && !seriesAxisName)) {
                var firstPointValue = SeriesBinder.current.bindPoint(currentSeries, 0).valueFields;
                typeSamples.push(firstPointValue[vertical ? "y" : "x"]);

                break;
            }
        }

        if (axisIndex === 0 && defaultRange) {
            range.min = Math.min(range.min, defaultRange.min);
            range.max = Math.max(range.max, defaultRange.max);
        }

        var inferredDate;

        for (var i = 0; i < typeSamples.length; i++) {
            if (typeSamples[i] instanceof Date) {
                inferredDate = true;
                break;
            }
        }

        var axisType;
        if (equalsIgnoreCase(axisOptions.type, DATE) || (!axisOptions.type && inferredDate)) {
            axisType = DateValueAxis;
        } else if (isLog) {
            axisType = LogarithmicAxis;
        } else {
            axisType = NumericAxis;
        }

        var axis = new axisType(range.min, range.max, axisOptions, this.chartService);
        axis.axisIndex = axisIndex;

        if (axisName) {
            if (namedAxes[axisName]) {
                throw new Error(((vertical ? "Y" : "X") + " axis with name " + axisName + " is already defined"));
            }
            namedAxes[axisName] = axis;
        }

        this.appendAxis(axis);

        return axis;
    };

    XYPlotArea.prototype.createAxes = function createAxes (panes) {
        var this$1 = this;

        var options = this.options;
        var xAxesOptions = [].concat(options.xAxis);
        var xAxes = [];
        var yAxesOptions = [].concat(options.yAxis);
        var yAxes = [];

        for (var idx = 0; idx < xAxesOptions.length; idx++) {
            var axisPane = this$1.findPane(xAxesOptions[idx].pane);
            if (inArray(axisPane, panes)) {
                xAxes.push(this$1.createXYAxis(xAxesOptions[idx], false, idx));
            }
        }

        for (var idx$1 = 0; idx$1 < yAxesOptions.length; idx$1++) {
            var axisPane$1 = this$1.findPane(yAxesOptions[idx$1].pane);
            if (inArray(axisPane$1, panes)) {
                yAxes.push(this$1.createXYAxis(yAxesOptions[idx$1], true, idx$1));
            }
        }

        this.axisX = this.axisX || xAxes[0];
        this.axisY = this.axisY || yAxes[0];
    };

    XYPlotArea.prototype._dispatchEvent = function _dispatchEvent (chart, e, eventType) {
        var coords = chart._eventCoordinates(e);
        var point = new Point(coords.x, coords.y);
        var allAxes = this.axes;
        var length = allAxes.length;
        var xValues = [];
        var yValues = [];

        for (var i = 0; i < length; i++) {
            var axis = allAxes[i];
            var values = axis.options.vertical ? yValues : xValues;
            var currentValue = axis.getValue(point);
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
    };

    XYPlotArea.prototype.updateAxisOptions = function updateAxisOptions$1 (axis, options) {
        var vertical = axis.options.vertical;
        var axes = this.groupAxes(this.panes);
        var index = (vertical ? axes.y : axes.x).indexOf(axis);

        updateAxisOptions(this.options, index, vertical, options);
        updateAxisOptions(this.originalOptions, index, vertical, options);
    };

    return XYPlotArea;
}(PlotAreaBase));

function updateAxisOptions(targetOptions, axisIndex, vertical, options) {
    var axisOptions = ([].concat(vertical ? targetOptions.yAxis : targetOptions.xAxis))[axisIndex];
    deepExtend(axisOptions, options);
}

setDefaultOptions(XYPlotArea, {
    xAxis: {},
    yAxis: {}
});

deepExtend(XYPlotArea.prototype, PlotAreaEventsMixin);

export default XYPlotArea;