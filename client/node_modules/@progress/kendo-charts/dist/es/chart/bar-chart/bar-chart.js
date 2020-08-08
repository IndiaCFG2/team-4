import { geometry as geom } from '@progress/kendo-drawing';

import Bar from './bar';

import CategoricalChart from '../categorical-chart';
import ClusterLayout from '../layout/cluster-layout';
import StackWrap from '../layout/stack-wrap';
import { BAR, OUTSIDE_END, INSIDE_END } from '../constants';

import anyHasZIndex from '../utils/any-has-z-index';

import { STRING, X, Y } from '../../common/constants';
import { defined, isFunction, setDefaultOptions } from '../../common';

var BarChart = (function (CategoricalChart) {
    function BarChart () {
        CategoricalChart.apply(this, arguments);
    }

    if ( CategoricalChart ) BarChart.__proto__ = CategoricalChart;
    BarChart.prototype = Object.create( CategoricalChart && CategoricalChart.prototype );
    BarChart.prototype.constructor = BarChart;

    BarChart.prototype.render = function render () {
        CategoricalChart.prototype.render.call(this);
        this.updateStackRange();
    };

    BarChart.prototype.pointType = function pointType () {
        return Bar;
    };

    BarChart.prototype.clusterType = function clusterType () {
        return ClusterLayout;
    };

    BarChart.prototype.stackType = function stackType () {
        return StackWrap;
    };

    BarChart.prototype.stackLimits = function stackLimits (axisName, stackName) {
        var limits = CategoricalChart.prototype.stackLimits.call(this, axisName, stackName);

        return limits;
    };

    BarChart.prototype.createPoint = function createPoint (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var ref = this;
        var options = ref.options;
        var children = ref.children;
        var isStacked = options.isStacked;
        var value = this.pointValue(data);
        var pointOptions = this.pointOptions(series, seriesIx);

        var labelOptions = pointOptions.labels;
        if (isStacked) {
            if (labelOptions.position === OUTSIDE_END) {
                labelOptions.position = INSIDE_END;
            }
        }

        pointOptions.isStacked = isStacked;

        var color = data.fields.color || series.color;
        if (value < 0 && pointOptions.negativeColor) {
            color = pointOptions.negativeColor;
        }

        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        var pointType = this.pointType();
        var point = new pointType(value, pointOptions);
        point.color = color;

        var cluster = children[categoryIx];
        if (!cluster) {
            var clusterType = this.clusterType();
            cluster = new clusterType({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        if (isStacked) {
            var stackWrap = this.getStackWrap(series, cluster);
            stackWrap.append(point);
        } else {
            cluster.append(point);
        }

        return point;
    };

    BarChart.prototype.getStackWrap = function getStackWrap (series, cluster) {
        var stack = series.stack;
        var stackGroup = stack ? stack.group || stack : stack;
        var wraps = cluster.children;
        var stackWrap;

        if (typeof stackGroup === STRING) {
            for (var i = 0; i < wraps.length; i++) {
                if (wraps[i]._stackGroup === stackGroup) {
                    stackWrap = wraps[i];
                    break;
                }
            }
        } else {
            stackWrap = wraps[0];
        }

        if (!stackWrap) {
            var stackType = this.stackType();
            stackWrap = new stackType({
                vertical: !this.options.invertAxes
            });
            stackWrap._stackGroup = stackGroup;
            cluster.append(stackWrap);
        }

        return stackWrap;
    };

    BarChart.prototype.categorySlot = function categorySlot (categoryAxis, categoryIx, valueAxis) {
        var options = this.options;
        var categorySlot = categoryAxis.getSlot(categoryIx);
        var startValue = valueAxis.startValue();

        if (options.isStacked) {
            var zeroSlot = valueAxis.getSlot(startValue, startValue, true);
            var stackAxis = options.invertAxes ? X : Y;
            categorySlot[stackAxis + 1] = categorySlot[stackAxis + 2] = zeroSlot[stackAxis + 1];
        }

        return categorySlot;
    };

    BarChart.prototype.reflowCategories = function reflowCategories (categorySlots) {
        var children = this.children;
        var childrenLength = children.length;

        for (var i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    };

    BarChart.prototype.createAnimation = function createAnimation () {
        this._setAnimationOptions();
        CategoricalChart.prototype.createAnimation.call(this);

        if (anyHasZIndex(this.options.series)) {
            this._setChildrenAnimation();
        }
    };

    BarChart.prototype._setChildrenAnimation = function _setChildrenAnimation () {
        var this$1 = this;

        var points = this.points;

        for (var idx = 0; idx < points.length; idx++) {
            var point = points[idx];
            var pointVisual = point.visual;
            if (pointVisual && defined(pointVisual.options.zIndex)) {
                point.options.animation = this$1.options.animation;
                point.createAnimation();
            }
        }
    };

    BarChart.prototype._setAnimationOptions = function _setAnimationOptions () {
        var options = this.options;
        var animation = options.animation || {};
        var origin;

        if (options.isStacked) {
            var valueAxis = this.seriesValueAxis(options.series[0]);
            origin = valueAxis.getSlot(valueAxis.startValue());
        } else {
            origin = this.categoryAxis.getSlot(0);
        }

        animation.origin = new geom.Point(origin.x1, origin.y1);
        animation.vertical = !options.invertAxes;
    };

    return BarChart;
}(CategoricalChart));

setDefaultOptions(BarChart, {
    animation: {
        type: BAR
    }
});

export default BarChart;