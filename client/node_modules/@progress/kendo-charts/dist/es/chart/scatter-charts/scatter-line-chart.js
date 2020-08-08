import ScatterChart from './scatter-chart';
import LineChartMixin from '../mixins/line-chart-mixin';
import LineSegment from '../line-chart/line-segment';
import SplineSegment from '../line-chart/spline-segment';

import { SMOOTH, ZERO } from '../constants';

import hasValue from '../utils/has-value';

import { deepExtend } from '../../common';

var ScatterLineChart = (function (ScatterChart) {
    function ScatterLineChart () {
        ScatterChart.apply(this, arguments);
    }

    if ( ScatterChart ) ScatterLineChart.__proto__ = ScatterChart;
    ScatterLineChart.prototype = Object.create( ScatterChart && ScatterChart.prototype );
    ScatterLineChart.prototype.constructor = ScatterLineChart;

    ScatterLineChart.prototype.render = function render () {
        ScatterChart.prototype.render.call(this);

        this.renderSegments();
    };

    ScatterLineChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx) {
        var style = currentSeries.style;
        var pointType;

        if (style === SMOOTH) {
            pointType = SplineSegment;
        } else {
            pointType = LineSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx);
    };

    ScatterLineChart.prototype.animationPoints = function animationPoints () {
        var points = ScatterChart.prototype.animationPoints.call(this);
        return points.concat(this._segments);
    };

    ScatterLineChart.prototype.createMissingValue = function createMissingValue (value, missingValues) {
        if (missingValues === ZERO) {
            var missingValue = {
                x: value.x,
                y: value.y
            };
            if (!hasValue(missingValue.x)) {
                missingValue.x = 0;
            }
            if (!hasValue(missingValue.y)) {
                missingValue.y = 0;
            }
            return missingValue;
        }
    };

    return ScatterLineChart;
}(ScatterChart));

deepExtend(ScatterLineChart.prototype, LineChartMixin);

export default ScatterLineChart;