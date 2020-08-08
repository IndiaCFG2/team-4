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

class RangeAreaChart extends CategoricalChart {

    render() {
        super.render();

        this.renderSegments();
    }

    pointType() {
        return RangeAreaPoint;
    }

    createPoint(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        let value = data.valueFields;

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

        let pointOptions = this.pointOptions(series, seriesIx);
        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        let color = data.fields.color || series.color;
        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        const point = new RangeAreaPoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    }

    createSegment(linePoints, currentSeries, seriesIx) {
        const style = (currentSeries.line || {}).style;
        let segmentType;
        if (style === "smooth") {
            segmentType = SplineRangeAreaSegment;
        } else if (style === "step") {
            segmentType = StepRangeAreaSegment;
        } else {
            segmentType = RangeAreaSegment;
        }

        return new segmentType(linePoints, currentSeries, seriesIx);
    }

    plotRange(point, startValue) {
        if (!point) {
            return [ startValue, startValue ];
        }

        return [ point.value.from, point.value.to ];
    }

    valueSlot(valueAxis, plotRange) {
        const fromSlot = valueAxis.getSlot(plotRange[0], plotRange[0], !this.options.clip);
        const toSlot = valueAxis.getSlot(plotRange[1], plotRange[1], !this.options.clip);
        if (fromSlot && toSlot) {
            return {
                from: fromSlot,
                to: toSlot
            };
        }
    }

    pointSlot(categorySlot, valueSlot) {
        const { from, to } = valueSlot;
        let fromSlot, toSlot;

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
    }

    addValue(data, fields) {
        const valueFields = data.valueFields;
        if (!isNumber(valueFields.from)) {
            valueFields.from = valueFields.to;
        }

        if (!isNumber(valueFields.to)) {
            valueFields.to = valueFields.from;
        }

        super.addValue(data, fields);
    }

    updateRange(value, fields) {
        if (value !== null && isNumber(value.from) && isNumber(value.to)) {
            const axisName = fields.series.axis;
            const axisRange = this.valueAxisRanges[axisName] = this.valueAxisRanges[axisName] || { min: MAX_VALUE, max: MIN_VALUE };
            const { from, to } = value;

            axisRange.min = Math.min(axisRange.min, from, to);
            axisRange.max = Math.max(axisRange.max, from, to);
        }
    }

    formatPointValue(point, format) {
        const value = point.value;

        return this.chartService.format.auto(format, value.from, value.to);
    }

    animationPoints() {
        const points = this.points;
        const result = [];
        for (let idx = 0; idx < points.length; idx++) {
            const point = points[idx];
            if (point) {
                result.push((point.fromPoint || {}).marker);
                result.push((point.toPoint || {}).marker);
            }
        }

        return result.concat(this._segments);
    }
}

deepExtend(RangeAreaChart.prototype, LineChartMixin, ClipAnimationMixin);

export default RangeAreaChart;
