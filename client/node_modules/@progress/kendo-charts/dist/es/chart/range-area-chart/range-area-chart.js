import CategoricalChart from '../categorical-chart';
import LineChartMixin from '../mixins/line-chart-mixin';
import ClipAnimationMixin from '../mixins/clip-animation-mixin';
import RangeAreaPoint from './range-area-point';
import RangeAreaSegment from './range-area-segment';
import SplineRangeAreaSegment from './spline-range-area-segment';
import StepRangeAreaSegment from './step-range-area-segment';

import { Box } from '../../core';
import { ZERO } from '../constants';
import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { isNumber } from '../../common';
import { deepExtend, isFunction } from '../../common';
import { hasValue } from '../utils';

var RangeAreaChart = (function (CategoricalChart) {
    function RangeAreaChart () {
        CategoricalChart.apply(this, arguments);
    }

    if ( CategoricalChart ) RangeAreaChart.__proto__ = CategoricalChart;
    RangeAreaChart.prototype = Object.create( CategoricalChart && CategoricalChart.prototype );
    RangeAreaChart.prototype.constructor = RangeAreaChart;

    RangeAreaChart.prototype.render = function render () {
        CategoricalChart.prototype.render.call(this);

        this.renderSegments();
    };

    RangeAreaChart.prototype.pointType = function pointType () {
        return RangeAreaPoint;
    };

    RangeAreaChart.prototype.createPoint = function createPoint (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var value = data.valueFields;

        if (!hasValue(value.from) && !hasValue(value.to)) {
            if (this.seriesMissingValues(series) === ZERO) {
                value = {
                    from: 0,
                    to: 0
                };
            } else {
                return null;
            }
        }

        var pointOptions = this.pointOptions(series, seriesIx);
        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        var color = data.fields.color || series.color;
        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        var point = new RangeAreaPoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    };

    RangeAreaChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx) {
        var style = (currentSeries.line || {}).style;
        var segmentType;
        if (style === "smooth") {
            segmentType = SplineRangeAreaSegment;
        } else if (style === "step") {
            segmentType = StepRangeAreaSegment;
        } else {
            segmentType = RangeAreaSegment;
        }

        return new segmentType(linePoints, currentSeries, seriesIx);
    };

    RangeAreaChart.prototype.plotRange = function plotRange (point, startValue) {
        if (!point) {
            return [ startValue, startValue ];
        }

        return [ point.value.from, point.value.to ];
    };

    RangeAreaChart.prototype.valueSlot = function valueSlot (valueAxis, plotRange) {
        var fromSlot = valueAxis.getSlot(plotRange[0], plotRange[0], !this.options.clip);
        var toSlot = valueAxis.getSlot(plotRange[1], plotRange[1], !this.options.clip);
        if (fromSlot && toSlot) {
            return {
                from: fromSlot,
                to: toSlot
            };
        }
    };

    RangeAreaChart.prototype.pointSlot = function pointSlot (categorySlot, valueSlot) {
        var from = valueSlot.from;
        var to = valueSlot.to;
        var fromSlot, toSlot;

        if (this.options.invertAxes) {
            fromSlot = new Box(from.x1, categorySlot.y1, from.x2, categorySlot.y2);
            toSlot = new Box(to.x1, categorySlot.y1, to.x2, categorySlot.y2);
        } else {
            fromSlot = new Box(categorySlot.x1, from.y1, categorySlot.x2, from.y2);
            toSlot = new Box(categorySlot.x1, to.y1, categorySlot.x2, to.y2);
        }

        return {
            from: fromSlot,
            to: toSlot
        };
    };

    RangeAreaChart.prototype.addValue = function addValue (data, fields) {
        var valueFields = data.valueFields;
        if (!isNumber(valueFields.from)) {
            valueFields.from = valueFields.to;
        }

        if (!isNumber(valueFields.to)) {
            valueFields.to = valueFields.from;
        }

        CategoricalChart.prototype.addValue.call(this, data, fields);
    };

    RangeAreaChart.prototype.updateRange = function updateRange (value, fields) {
        if (value !== null && isNumber(value.from) && isNumber(value.to)) {
            var axisName = fields.series.axis;
            var axisRange = this.valueAxisRanges[axisName] = this.valueAxisRanges[axisName] || { min: MAX_VALUE, max: MIN_VALUE };
            var from = value.from;
            var to = value.to;

            axisRange.min = Math.min(axisRange.min, from, to);
            axisRange.max = Math.max(axisRange.max, from, to);
        }
    };

    RangeAreaChart.prototype.formatPointValue = function formatPointValue (point, format) {
        var value = point.value;

        return this.chartService.format.auto(format, value.from, value.to);
    };

    RangeAreaChart.prototype.animationPoints = function animationPoints () {
        var points = this.points;
        var result = [];
        for (var idx = 0; idx < points.length; idx++) {
            var point = points[idx];
            if (point) {
                result.push((point.fromPoint || {}).marker);
                result.push((point.toPoint || {}).marker);
            }
        }

        return result.concat(this._segments);
    };

    return RangeAreaChart;
}(CategoricalChart));

deepExtend(RangeAreaChart.prototype, LineChartMixin, ClipAnimationMixin);

export default RangeAreaChart;
