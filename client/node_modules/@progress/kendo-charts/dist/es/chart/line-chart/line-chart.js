import CategoricalChart from '../categorical-chart';
import LinePoint from './line-point';
import LineSegment from './line-segment';
import StepLineSegment from './step-line-segment';
import SplineSegment from './spline-segment';
import LineChartMixin from '../mixins/line-chart-mixin';
import ClipAnimationMixin from '../mixins/clip-animation-mixin';

import { ZERO, SMOOTH, STEP } from '../constants';

import { deepExtend, defined, isFunction } from '../../common';

var LineChart = (function (CategoricalChart) {
    function LineChart () {
        CategoricalChart.apply(this, arguments);
    }

    if ( CategoricalChart ) LineChart.__proto__ = CategoricalChart;
    LineChart.prototype = Object.create( CategoricalChart && CategoricalChart.prototype );
    LineChart.prototype.constructor = LineChart;

    LineChart.prototype.render = function render () {

        CategoricalChart.prototype.render.call(this);

        this.updateStackRange();
        this.renderSegments();
    };

    LineChart.prototype.pointType = function pointType () {
        return LinePoint;
    };

    LineChart.prototype.createPoint = function createPoint (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var missingValues = this.seriesMissingValues(series);
        var value = data.valueFields.value;

        if (!defined(value) || value === null) {
            if (missingValues === ZERO) {
                value = 0;
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

        var point = new LinePoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    };

    LineChart.prototype.plotRange = function plotRange (point) {
        var this$1 = this;

        var plotValue = this.plotValue(point);

        if (this.options.isStacked) {
            var categoryIx = point.categoryIx;
            var categoryPoints = this.categoryPoints[categoryIx];

            for (var i = 0; i < categoryPoints.length; i++) {
                var other = categoryPoints[i];

                if (point === other) {
                    break;
                }

                plotValue += this$1.plotValue(other);

                if (this$1.options.isStacked100) {
                    plotValue = Math.min(plotValue, 1);
                }
            }

        }

        return [ plotValue, plotValue ];
    };

    LineChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx) {
        var style = currentSeries.style;
        var pointType;

        if (style === STEP) {
            pointType = StepLineSegment;
        } else if (style === SMOOTH) {
            pointType = SplineSegment;
        } else {
            pointType = LineSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx);
    };

    LineChart.prototype.animationPoints = function animationPoints () {
        var points = this.points;
        var result = [];
        for (var idx = 0; idx < points.length; idx++) {
            result.push((points[idx] || {}).marker);
        }
        return result.concat(this._segments);
    };

    return LineChart;
}(CategoricalChart));

deepExtend(LineChart.prototype, LineChartMixin, ClipAnimationMixin);

export default LineChart;