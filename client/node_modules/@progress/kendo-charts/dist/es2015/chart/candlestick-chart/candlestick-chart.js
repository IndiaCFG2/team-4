import CategoricalChart from '../categorical-chart';
import ClusterLayout from '../layout/cluster-layout';
import Candlestick from './candlestick';

import ClipAnimationMixin from '../mixins/clip-animation-mixin';
import { CANDLESTICK } from '../constants';
import areNumbers from '../utils/are-numbers';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { deepExtend, isFunction } from '../../common';

class CandlestickChart extends CategoricalChart {

    reflowCategories(categorySlots) {
        const children = this.children;
        const childrenLength = children.length;

        for (let i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    }

    addValue(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const { children, options } = this;
        const value = data.valueFields;
        const valueParts = this.splitValue(value);
        const hasValue = areNumbers(valueParts);
        const dataItem = series.data[categoryIx];
        let categoryPoints = this.categoryPoints[categoryIx];
        let point;

        if (!categoryPoints) {
            this.categoryPoints[categoryIx] = categoryPoints = [];
        }

        if (hasValue) {
            point = this.createPoint(data, fields);
        }

        let cluster = children[categoryIx];
        if (!cluster) {
            cluster = new ClusterLayout({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        if (point) {
            this.updateRange(value, fields);

            cluster.append(point);

            point.categoryIx = categoryIx;
            point.category = category;
            point.series = series;
            point.seriesIx = seriesIx;
            point.owner = this;
            point.dataItem = dataItem;
            point.noteText = data.fields.noteText;
        }

        this.points.push(point);
        categoryPoints.push(point);
    }

    pointType() {
        return Candlestick;
    }

    createPoint(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const pointType = this.pointType();
        const value = data.valueFields;
        let pointOptions = deepExtend({}, series);
        let color = data.fields.color || series.color;

        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        if (series.type === CANDLESTICK) {
            if (value.open > value.close) {
                color = data.fields.downColor || series.downColor || series.color;
            }
        }

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        pointOptions.vertical = !this.options.invertAxes;

        const point = new pointType(value, pointOptions);
        point.color = color;

        return point;
    }

    splitValue(value) {
        return [ value.low, value.open, value.close, value.high ];
    }

    updateRange(value, fields) {
        const axisName = fields.series.axis;
        const parts = this.splitValue(value);
        let axisRange = this.valueAxisRanges[axisName];

        axisRange = this.valueAxisRanges[axisName] =
            axisRange || { min: MAX_VALUE, max: MIN_VALUE };

        axisRange = this.valueAxisRanges[axisName] = {
            min: Math.min.apply(Math, parts.concat([ axisRange.min ])),
            max: Math.max.apply(Math, parts.concat([ axisRange.max ]))
        };
    }

    formatPointValue(point, format) {
        const value = point.value;

        return this.chartService.format.auto(format,
            value.open, value.high,
            value.low, value.close, point.category
        );
    }

    animationPoints() {
        return this.points;
    }
}

deepExtend(CandlestickChart.prototype, ClipAnimationMixin);

export default CandlestickChart;