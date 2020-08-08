import PolarLineChart from '../polar-line-chart/polar-line-chart';
import SplinePolarAreaSegment from './spline-polar-area-segment';
import PolarAreaSegment from './polar-area-segment';

import { SMOOTH, INTERPOLATE, ZERO, GAP } from '../constants';

import hasValue from '../utils/has-value';

var PolarAreaChart = (function (PolarLineChart) {
    function PolarAreaChart () {
        PolarLineChart.apply(this, arguments);
    }

    if ( PolarLineChart ) PolarAreaChart.__proto__ = PolarLineChart;
    PolarAreaChart.prototype = Object.create( PolarLineChart && PolarLineChart.prototype );
    PolarAreaChart.prototype.constructor = PolarAreaChart;

    PolarAreaChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx) {
        var style = (currentSeries.line || {}).style;
        var segment;

        if (style === SMOOTH) {
            segment = new SplinePolarAreaSegment(linePoints, currentSeries, seriesIx);
        } else {
            segment = new PolarAreaSegment(linePoints, currentSeries, seriesIx);
        }
        return segment;
    };

    PolarAreaChart.prototype.createMissingValue = function createMissingValue (value, missingValues) {
        var missingValue;

        if (hasValue(value.x) && missingValues !== INTERPOLATE) {
            missingValue = {
                x: value.x,
                y: value.y
            };
            if (missingValues === ZERO) {
                missingValue.y = 0;
            }
        }

        return missingValue;
    };

    PolarAreaChart.prototype.seriesMissingValues = function seriesMissingValues (series) {
        return series.missingValues || ZERO;
    };

    PolarAreaChart.prototype._hasMissingValuesGap = function _hasMissingValuesGap () {
        var this$1 = this;

        var series = this.options.series;

        for (var idx = 0; idx < series.length; idx++) {
            if (this$1.seriesMissingValues(series[idx]) === GAP) {
                return true;
            }
        }
    };

    PolarAreaChart.prototype.sortPoints = function sortPoints (points) {
        var this$1 = this;

        points.sort(xComparer);

        if (this._hasMissingValuesGap()) {
            for (var idx = 0; idx < points.length; idx++) {
                var point = points[idx];
                if (point) {
                    var value = point.value;
                    if (!hasValue(value.y) && this$1.seriesMissingValues(point.series) === GAP) {
                        delete points[idx];
                    }
                }
            }
        }

        return points;
    };

    return PolarAreaChart;
}(PolarLineChart));

function xComparer(a, b) {
    return a.value.x - b.value.x;
}

export default PolarAreaChart;