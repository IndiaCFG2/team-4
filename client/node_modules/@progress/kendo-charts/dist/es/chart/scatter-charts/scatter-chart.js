import { ChartElement, Box } from '../../core';

import ClipAnimationMixin from '../mixins/clip-animation-mixin';
import ErrorRangeCalculator from '../error-bars/error-range-calculator';
import ScatterErrorBar from '../error-bars/scatter-error-bar';
import LinePoint from '../line-chart/line-point';
import CategoricalChart from '../categorical-chart';

import hasValue from '../utils/has-value';
import evalOptions from '../utils/eval-options';

import { deepExtend, isNumber, isString, defined, isFunction, setDefaultOptions } from '../../common';
import { X, Y, MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { parseDate } from '../../date-utils';

var ScatterChart = (function (ChartElement) {
    function ScatterChart(plotArea, options) {

        ChartElement.call(this, options);

        this.plotArea = plotArea;
        this.chartService = plotArea.chartService;
        this._initFields();

        this.render();
    }

    if ( ChartElement ) ScatterChart.__proto__ = ChartElement;
    ScatterChart.prototype = Object.create( ChartElement && ChartElement.prototype );
    ScatterChart.prototype.constructor = ScatterChart;

    ScatterChart.prototype._initFields = function _initFields () {
        // X and Y axis ranges grouped by name, e.g.:
        // primary: { min: 0, max: 1 }
        this.xAxisRanges = {};
        this.yAxisRanges = {};

        this.points = [];
        this.seriesPoints = [];
        this.seriesOptions = [];
        this._evalSeries = [];
    };

    ScatterChart.prototype.render = function render () {
        this.traverseDataPoints(this.addValue.bind(this));
    };

    ScatterChart.prototype.addErrorBar = function addErrorBar (point, field, fields) {
        var value = point.value[field];
        var valueErrorField = field + "Value";
        var lowField = field + "ErrorLow";
        var highField = field + "ErrorHigh";
        var seriesIx = fields.seriesIx;
        var series = fields.series;
        var errorBars = point.options.errorBars;
        var lowValue = fields[lowField];
        var highValue = fields[highField];

        if (isNumber(value)) {
            var errorRange;
            if (isNumber(lowValue) && isNumber(highValue)) {
                errorRange = { low: lowValue, high: highValue };
            }

            if (errorBars && defined(errorBars[valueErrorField])) {
                this.seriesErrorRanges = this.seriesErrorRanges || { x: [], y: [] };
                this.seriesErrorRanges[field][seriesIx] = this.seriesErrorRanges[field][seriesIx] ||
                    new ErrorRangeCalculator(errorBars[valueErrorField], series, field);

                errorRange = this.seriesErrorRanges[field][seriesIx].getErrorRange(value, errorBars[valueErrorField]);
            }

            if (errorRange) {
                this.addPointErrorBar(errorRange, point, field);
            }
        }
    };

    ScatterChart.prototype.addPointErrorBar = function addPointErrorBar (errorRange, point, field) {
        var low = errorRange.low;
        var high = errorRange.high;
        var series = point.series;
        var options = point.options.errorBars;
        var isVertical = field === Y;
        var item = {};

        point[field + "Low"] = low;
        point[field + "High"] = high;

        point.errorBars = point.errorBars || [];
        var errorBar = new ScatterErrorBar(low, high, isVertical, this, series, options);
        point.errorBars.push(errorBar);
        point.append(errorBar);

        item[field] = low;
        this.updateRange(item, series);
        item[field] = high;
        this.updateRange(item, series);
    };

    ScatterChart.prototype.addValue = function addValue (value, fields) {
        var x = value.x;
        var y = value.y;
        var seriesIx = fields.seriesIx;
        var series = this.options.series[seriesIx];
        var missingValues = this.seriesMissingValues(series);
        var seriesPoints = this.seriesPoints[seriesIx];

        var pointValue = value;
        if (!(hasValue(x) && hasValue(y))) {
            pointValue = this.createMissingValue(pointValue, missingValues);
        }

        var point;
        if (pointValue) {
            point = this.createPoint(pointValue, fields);
            if (point) {
                Object.assign(point, fields);
                this.addErrorBar(point, X, fields);
                this.addErrorBar(point, Y, fields);
            }
            this.updateRange(pointValue, fields.series);
        }

        this.points.push(point);
        seriesPoints.push(point);
    };

    ScatterChart.prototype.seriesMissingValues = function seriesMissingValues (series) {
        return series.missingValues;
    };

    ScatterChart.prototype.createMissingValue = function createMissingValue () {};

    ScatterChart.prototype.updateRange = function updateRange (value, series) {
        var intlService = this.chartService.intl;
        var xAxisName = series.xAxis;
        var yAxisName = series.yAxis;
        var x = value.x;
        var y = value.y;
        var xAxisRange = this.xAxisRanges[xAxisName];
        var yAxisRange = this.yAxisRanges[yAxisName];

        if (hasValue(x)) {
            xAxisRange = this.xAxisRanges[xAxisName] =
                xAxisRange || { min: MAX_VALUE, max: MIN_VALUE };

            if (isString(x)) {
                x = parseDate(intlService, x);
            }

            xAxisRange.min = Math.min(xAxisRange.min, x);
            xAxisRange.max = Math.max(xAxisRange.max, x);
        }

        if (hasValue(y)) {
            yAxisRange = this.yAxisRanges[yAxisName] =
                yAxisRange || { min: MAX_VALUE, max: MIN_VALUE };

            if (isString(y)) {
                y = parseDate(intlService, y);
            }

            yAxisRange.min = Math.min(yAxisRange.min, y);
            yAxisRange.max = Math.max(yAxisRange.max, y);
        }
    };

    ScatterChart.prototype.evalPointOptions = function evalPointOptions (options, value, fields) {
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var state = { defaults: series._defaults, excluded: [ "data", "tooltip", "content", "template", "visual", "toggle", "_outOfRangeMinPoint", "_outOfRangeMaxPoint" ] };

        var doEval = this._evalSeries[seriesIx];
        if (!defined(doEval)) {
            this._evalSeries[seriesIx] = doEval = evalOptions(options, {}, state, true);
        }

        var pointOptions = options;
        if (doEval) {
            pointOptions = deepExtend({}, options);
            evalOptions(pointOptions, {
                value: value,
                series: series,
                dataItem: fields.dataItem
            }, state);
        }

        return pointOptions;
    };

    ScatterChart.prototype.pointType = function pointType () {
        return LinePoint;
    };

    ScatterChart.prototype.pointOptions = function pointOptions (series, seriesIx) {
        var options = this.seriesOptions[seriesIx];
        if (!options) {
            var defaults = this.pointType().prototype.defaults;
            this.seriesOptions[seriesIx] = options = deepExtend({}, defaults, {
                markers: {
                    opacity: series.opacity
                },
                tooltip: {
                    format: this.options.tooltip.format
                },
                labels: {
                    format: this.options.labels.format
                }
            }, series);
        }

        return options;
    };

    ScatterChart.prototype.createPoint = function createPoint (value, fields) {
        var series = fields.series;
        var pointOptions = this.pointOptions(series, fields.seriesIx);
        var color = fields.color || series.color;

        pointOptions = this.evalPointOptions(pointOptions, value, fields);

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        var point = new LinePoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    };

    ScatterChart.prototype.seriesAxes = function seriesAxes (series) {
        var xAxisName = series.xAxis;
        var yAxisName = series.yAxis;
        var plotArea = this.plotArea;
        var xAxis = xAxisName ? plotArea.namedXAxes[xAxisName] : plotArea.axisX;
        var yAxis = yAxisName ? plotArea.namedYAxes[yAxisName] : plotArea.axisY;

        if (!xAxis) {
            throw new Error("Unable to locate X axis with name " + xAxisName);
        }

        if (!yAxis) {
            throw new Error("Unable to locate Y axis with name " + yAxisName);
        }

        return {
            x: xAxis,
            y: yAxis
        };
    };

    ScatterChart.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        var chartPoints = this.points;
        var limit = !this.options.clip;
        var pointIx = 0;


        this.traverseDataPoints(function (value, fields) {
            var point = chartPoints[pointIx++];
            var seriesAxes = this$1.seriesAxes(fields.series);
            var slotX = seriesAxes.x.getSlot(value.x, value.x, limit);
            var slotY = seriesAxes.y.getSlot(value.y, value.y, limit);

            if (point) {
                if (slotX && slotY) {
                    var pointSlot = this$1.pointSlot(slotX, slotY);
                    point.reflow(pointSlot);
                } else {
                    point.visible = false;
                }
            }
        });

        this.box = targetBox;
    };

    ScatterChart.prototype.pointSlot = function pointSlot (slotX, slotY) {
        return new Box(slotX.x1, slotY.y1, slotX.x2, slotY.y2);
    };

    ScatterChart.prototype.traverseDataPoints = function traverseDataPoints (callback) {
        var this$1 = this;

        var ref = this;
        var series = ref.options.series;
        var seriesPoints = ref.seriesPoints;

        for (var seriesIx = 0; seriesIx < series.length; seriesIx++) {
            var currentSeries = series[seriesIx];
            var currentSeriesPoints = seriesPoints[seriesIx];
            if (!currentSeriesPoints) {
                seriesPoints[seriesIx] = [];
            }

            for (var pointIx = 0; pointIx < currentSeries.data.length; pointIx++) {
                var ref$1 = this$1._bindPoint(currentSeries, seriesIx, pointIx);
                var value = ref$1.valueFields;
                var fields = ref$1.fields;

                callback(value, deepExtend({
                    pointIx: pointIx,
                    series: currentSeries,
                    seriesIx: seriesIx,
                    dataItem: currentSeries.data[pointIx],
                    owner: this$1
                }, fields));
            }
        }
    };

    ScatterChart.prototype.formatPointValue = function formatPointValue (point, format) {
        var value = point.value;
        return this.chartService.format.auto(format, value.x, value.y);
    };

    ScatterChart.prototype.animationPoints = function animationPoints () {
        var points = this.points;
        var result = [];
        for (var idx = 0; idx < points.length; idx++) {
            result.push((points[idx] || {}).marker);
        }
        return result;
    };

    return ScatterChart;
}(ChartElement));
setDefaultOptions(ScatterChart, {
    series: [],
    tooltip: {
        format: "{0}, {1}"
    },
    labels: {
        format: "{0}, {1}"
    },
    clip: true
});
deepExtend(ScatterChart.prototype, ClipAnimationMixin, {
    _bindPoint: CategoricalChart.prototype._bindPoint
});

export default ScatterChart;