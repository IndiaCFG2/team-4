import RadarLineChart from '../radar-line-chart/radar-line-chart';
import SplineRadarAreaSegment from './spline-radar-area-segment';
import RadarAreaSegment from './radar-area-segment';

import { SMOOTH, ZERO } from '../constants';

var RadarAreaChart = (function (RadarLineChart) {
    function RadarAreaChart () {
        RadarLineChart.apply(this, arguments);
    }

    if ( RadarLineChart ) RadarAreaChart.__proto__ = RadarLineChart;
    RadarAreaChart.prototype = Object.create( RadarLineChart && RadarLineChart.prototype );
    RadarAreaChart.prototype.constructor = RadarAreaChart;

    RadarAreaChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx, prevSegment) {
        var isStacked = this.options.isStacked;
        var style = (currentSeries.line || {}).style;
        var previousSegment;
        var stackPoints;
        var segment;

        if (isStacked && seriesIx > 0 && prevSegment) {
            stackPoints = prevSegment.linePoints.slice(0);
            previousSegment = prevSegment;
        }

        if (style === SMOOTH) {
            segment = new SplineRadarAreaSegment(linePoints, currentSeries, seriesIx, previousSegment, stackPoints);
            segment.options.closed = true;
        } else {
            linePoints.push(linePoints[0]);
            segment = new RadarAreaSegment(linePoints, currentSeries, seriesIx, previousSegment, stackPoints);
        }

        return segment;
    };

    RadarAreaChart.prototype.seriesMissingValues = function seriesMissingValues (series) {
        return series.missingValues || ZERO;
    };

    return RadarAreaChart;
}(RadarLineChart));

export default RadarAreaChart;