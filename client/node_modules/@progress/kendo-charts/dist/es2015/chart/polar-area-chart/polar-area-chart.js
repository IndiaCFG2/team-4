import PolarLineChart from '../polar-line-chart/polar-line-chart';
import SplinePolarAreaSegment from './spline-polar-area-segment';
import PolarAreaSegment from './polar-area-segment';

import { SMOOTH, INTERPOLATE, ZERO, GAP } from '../constants';

import hasValue from '../utils/has-value';

class PolarAreaChart extends PolarLineChart {
    createSegment(linePoints, currentSeries, seriesIx) {
        const style = (currentSeries.line || {}).style;
        let segment;

        if (style === SMOOTH) {
            segment = new SplinePolarAreaSegment(linePoints, currentSeries, seriesIx);
        } else {
            segment = new PolarAreaSegment(linePoints, currentSeries, seriesIx);
        }
        return segment;
    }

    createMissingValue(value, missingValues) {
        let missingValue;

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
    }

    seriesMissingValues(series) {
        return series.missingValues || ZERO;
    }

    _hasMissingValuesGap() {
        const series = this.options.series;

        for (let idx = 0; idx < series.length; idx++) {
            if (this.seriesMissingValues(series[idx]) === GAP) {
                return true;
            }
        }
    }

    sortPoints(points) {
        points.sort(xComparer);

        if (this._hasMissingValuesGap()) {
            for (let idx = 0; idx < points.length; idx++) {
                const point = points[idx];
                if (point) {
                    const value = point.value;
                    if (!hasValue(value.y) && this.seriesMissingValues(point.series) === GAP) {
                        delete points[idx];
                    }
                }
            }
        }

        return points;
    }
}

function xComparer(a, b) {
    return a.value.x - b.value.x;
}

export default PolarAreaChart;