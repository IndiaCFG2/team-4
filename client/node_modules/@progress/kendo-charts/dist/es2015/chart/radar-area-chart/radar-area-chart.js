import RadarLineChart from '../radar-line-chart/radar-line-chart';
import SplineRadarAreaSegment from './spline-radar-area-segment';
import RadarAreaSegment from './radar-area-segment';

import { SMOOTH, ZERO } from '../constants';

class RadarAreaChart extends RadarLineChart {
    createSegment(linePoints, currentSeries, seriesIx, prevSegment) {
        const isStacked = this.options.isStacked;
        const style = (currentSeries.line || {}).style;
        let previousSegment;
        let stackPoints;
        let segment;

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
    }

    seriesMissingValues(series) {
        return series.missingValues || ZERO;
    }
}

export default RadarAreaChart;