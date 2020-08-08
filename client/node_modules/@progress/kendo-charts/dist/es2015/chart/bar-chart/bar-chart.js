import { geometry as geom } from '@progress/kendo-drawing';

import Bar from './bar';

import CategoricalChart from '../categorical-chart';
import ClusterLayout from '../layout/cluster-layout';
import StackWrap from '../layout/stack-wrap';
import { BAR, OUTSIDE_END, INSIDE_END } from '../constants';

import anyHasZIndex from '../utils/any-has-z-index';

import { STRING, X, Y } from '../../common/constants';
import { defined, isFunction, setDefaultOptions } from '../../common';

class BarChart extends CategoricalChart {

    render() {
        super.render();
        this.updateStackRange();
    }

    pointType() {
        return Bar;
    }

    clusterType() {
        return ClusterLayout;
    }

    stackType() {
        return StackWrap;
    }

    stackLimits(axisName, stackName) {
        const limits = super.stackLimits(axisName, stackName);

        return limits;
    }

    createPoint(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const { options, children } = this;
        const isStacked = options.isStacked;
        const value = this.pointValue(data);
        let pointOptions = this.pointOptions(series, seriesIx);

        const labelOptions = pointOptions.labels;
        if (isStacked) {
            if (labelOptions.position === OUTSIDE_END) {
                labelOptions.position = INSIDE_END;
            }
        }

        pointOptions.isStacked = isStacked;

        let color = data.fields.color || series.color;
        if (value < 0 && pointOptions.negativeColor) {
            color = pointOptions.negativeColor;
        }

        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        const pointType = this.pointType();
        const point = new pointType(value, pointOptions);
        point.color = color;

        let cluster = children[categoryIx];
        if (!cluster) {
            const clusterType = this.clusterType();
            cluster = new clusterType({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        if (isStacked) {
            const stackWrap = this.getStackWrap(series, cluster);
            stackWrap.append(point);
        } else {
            cluster.append(point);
        }

        return point;
    }

    getStackWrap(series, cluster) {
        const stack = series.stack;
        const stackGroup = stack ? stack.group || stack : stack;
        const wraps = cluster.children;
        let stackWrap;

        if (typeof stackGroup === STRING) {
            for (let i = 0; i < wraps.length; i++) {
                if (wraps[i]._stackGroup === stackGroup) {
                    stackWrap = wraps[i];
                    break;
                }
            }
        } else {
            stackWrap = wraps[0];
        }

        if (!stackWrap) {
            const stackType = this.stackType();
            stackWrap = new stackType({
                vertical: !this.options.invertAxes
            });
            stackWrap._stackGroup = stackGroup;
            cluster.append(stackWrap);
        }

        return stackWrap;
    }

    categorySlot(categoryAxis, categoryIx, valueAxis) {
        const options = this.options;
        const categorySlot = categoryAxis.getSlot(categoryIx);
        const startValue = valueAxis.startValue();

        if (options.isStacked) {
            const zeroSlot = valueAxis.getSlot(startValue, startValue, true);
            const stackAxis = options.invertAxes ? X : Y;
            categorySlot[stackAxis + 1] = categorySlot[stackAxis + 2] = zeroSlot[stackAxis + 1];
        }

        return categorySlot;
    }

    reflowCategories(categorySlots) {
        const children = this.children;
        const childrenLength = children.length;

        for (let i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    }

    createAnimation() {
        this._setAnimationOptions();
        super.createAnimation();

        if (anyHasZIndex(this.options.series)) {
            this._setChildrenAnimation();
        }
    }

    _setChildrenAnimation() {
        const points = this.points;

        for (let idx = 0; idx < points.length; idx++) {
            const point = points[idx];
            const pointVisual = point.visual;
            if (pointVisual && defined(pointVisual.options.zIndex)) {
                point.options.animation = this.options.animation;
                point.createAnimation();
            }
        }
    }

    _setAnimationOptions() {
        const options = this.options;
        const animation = options.animation || {};
        let origin;

        if (options.isStacked) {
            const valueAxis = this.seriesValueAxis(options.series[0]);
            origin = valueAxis.getSlot(valueAxis.startValue());
        } else {
            origin = this.categoryAxis.getSlot(0);
        }

        animation.origin = new geom.Point(origin.x1, origin.y1);
        animation.vertical = !options.invertAxes;
    }
}

setDefaultOptions(BarChart, {
    animation: {
        type: BAR
    }
});

export default BarChart;