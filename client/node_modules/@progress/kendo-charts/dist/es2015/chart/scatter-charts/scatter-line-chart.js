import ScatterChart from './scatter-chart';
import LineChartMixin from '../mixins/line-chart-mixin';
import LineSegment from '../line-chart/line-segment';
import SplineSegment from '../line-chart/spline-segment';

import { SMOOTH, ZERO } from '../constants';

import hasValue from '../utils/has-value';

import { deepExtend } from '../../common';

class ScatterLineChart extends ScatterChart {
    render() {
        super.render();

        this.renderSegments();
    }

    createSegment(linePoints, currentSeries, seriesIx) {
        const style = currentSeries.style;
        let pointType;

        if (style === SMOOTH) {
            pointType = SplineSegment;
        } else {
            pointType = LineSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx);
    }

    animationPoints() {
        const points = super.animationPoints();
        return points.concat(this._segments);
    }

    createMissingValue(value, missingValues) {
        if (missingValues === ZERO) {
            const missingValue = {
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
    }
}

deepExtend(ScatterLineChart.prototype, LineChartMixin);

export default ScatterLineChart;