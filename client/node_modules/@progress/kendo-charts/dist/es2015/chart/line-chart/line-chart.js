import CategoricalChart from '../categorical-chart';
import LinePoint from './line-point';
import LineSegment from './line-segment';
import StepLineSegment from './step-line-segment';
import SplineSegment from './spline-segment';
import LineChartMixin from '../mixins/line-chart-mixin';
import ClipAnimationMixin from '../mixins/clip-animation-mixin';

import { ZERO, SMOOTH, STEP } from '../constants';

import { deepExtend, defined, isFunction } from '../../common';

class LineChart extends CategoricalChart {
    render() {

        super.render();

        this.updateStackRange();
        this.renderSegments();
    }

    pointType() {
        return LinePoint;
    }

    createPoint(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const missingValues = this.seriesMissingValues(series);
        let value = data.valueFields.value;

        if (!defined(value) || value === null) {
            if (missingValues === ZERO) {
                value = 0;
            } else {
                return null;
            }
        }

        let pointOptions = this.pointOptions(series, seriesIx);
        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        let color = data.fields.color || series.color;
        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        const point = new LinePoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    }

    plotRange(point) {
        let plotValue = this.plotValue(point);

        if (this.options.isStacked) {
            const categoryIx = point.categoryIx;
            const categoryPoints = this.categoryPoints[categoryIx];

            for (let i = 0; i < categoryPoints.length; i++) {
                const other = categoryPoints[i];

                if (point === other) {
                    break;
                }

                plotValue += this.plotValue(other);

                if (this.options.isStacked100) {
                    plotValue = Math.min(plotValue, 1);
                }
            }

        }

        return [ plotValue, plotValue ];
    }

    createSegment(linePoints, currentSeries, seriesIx) {
        const style = currentSeries.style;
        let pointType;

        if (style === STEP) {
            pointType = StepLineSegment;
        } else if (style === SMOOTH) {
            pointType = SplineSegment;
        } else {
            pointType = LineSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx);
    }

    animationPoints() {
        const points = this.points;
        const result = [];
        for (let idx = 0; idx < points.length; idx++) {
            result.push((points[idx] || {}).marker);
        }
        return result.concat(this._segments);
    }
}

deepExtend(LineChart.prototype, LineChartMixin, ClipAnimationMixin);

export default LineChart;