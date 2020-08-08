
import CategoricalChart from '../categorical-chart';
import BarChart from '../bar-chart/bar-chart';
import Bullet from './bullet';
import ClusterLayout from '../layout/cluster-layout';
import { BAR } from '../constants';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { deepExtend, defined, isArray, isFunction, isObject, setDefaultOptions } from '../../common';

class BulletChart extends CategoricalChart {
    constructor(plotArea, options) {

        wrapData(options);

        super(plotArea, options);
    }

    reflowCategories(categorySlots) {
        const children = this.children;
        const childrenLength = children.length;

        for (let i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    }

    plotRange(point) {
        const series = point.series;
        const valueAxis = this.seriesValueAxis(series);
        const axisCrossingValue = this.categoryAxisCrossingValue(valueAxis);

        return [ axisCrossingValue, point.value.current || axisCrossingValue ];
    }

    createPoint(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const { options, children } = this;
        const value = data.valueFields;

        let bulletOptions = deepExtend({
            vertical: !options.invertAxes,
            overlay: series.overlay,
            categoryIx: categoryIx,
            invertAxes: options.invertAxes
        }, series);

        let color = data.fields.color || series.color;
        bulletOptions = this.evalPointOptions(
            bulletOptions, value, category, categoryIx, series, seriesIx
        );

        if (isFunction(series.color)) {
            color = bulletOptions.color;
        }

        const bullet = new Bullet(value, bulletOptions);
        bullet.color = color;

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

        cluster.append(bullet);

        return bullet;
    }

    updateRange(value, fields) {
        const { current, target } = value;
        const axisName = fields.series.axis;
        let axisRange = this.valueAxisRanges[axisName];

        if (defined(current) && !isNaN(current) && defined(target && !isNaN(target))) {
            axisRange = this.valueAxisRanges[axisName] =
                axisRange || { min: MAX_VALUE, max: MIN_VALUE };

            axisRange.min = Math.min(axisRange.min, current, target);
            axisRange.max = Math.max(axisRange.max, current, target);
        }
    }

    formatPointValue(point, format) {
        return this.chartService.format.auto(format, point.value.current, point.value.target);
    }

    pointValue(data) {
        return data.valueFields.current;
    }

    aboveAxis(point) {
        const value = point.value.current;

        return value > 0;
    }

    createAnimation() {
        const points = this.points;

        this._setAnimationOptions();

        for (let idx = 0; idx < points.length; idx++) {
            const point = points[idx];
            point.options.animation = this.options.animation;
            point.createAnimation();
        }
    }
}

BulletChart.prototype._setAnimationOptions = BarChart.prototype._setAnimationOptions;

setDefaultOptions(BulletChart, {
    animation: {
        type: BAR
    }
});

function wrapData(options) {
    const series = options.series;

    for (let i = 0; i < series.length; i++) {
        const seriesItem = series[i];
        const data = seriesItem.data;
        if (data && !isArray(data[0]) && !isObject(data[0])) {
            seriesItem.data = [ data ];
        }
    }
}

export default BulletChart;