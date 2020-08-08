import BarChart from '../bar-chart/bar-chart';
import RadarSegment from './radar-segment';
import RadarClusterLayout from '../layout/radar-cluster-layout';
import RadarStackLayout from '../layout/radar-stack-layout';
import CategoricalChart from '../categorical-chart';

import { setDefaultOptions } from '../../common';

var RadarBarChart = (function (BarChart) {
    function RadarBarChart () {
        BarChart.apply(this, arguments);
    }

    if ( BarChart ) RadarBarChart.__proto__ = BarChart;
    RadarBarChart.prototype = Object.create( BarChart && BarChart.prototype );
    RadarBarChart.prototype.constructor = RadarBarChart;

    RadarBarChart.prototype.pointType = function pointType () {
        return RadarSegment;
    };

    RadarBarChart.prototype.clusterType = function clusterType () {
        return RadarClusterLayout;
    };

    RadarBarChart.prototype.stackType = function stackType () {
        return RadarStackLayout;
    };

    RadarBarChart.prototype.categorySlot = function categorySlot (categoryAxis, categoryIx) {
        return categoryAxis.getSlot(categoryIx);
    };

    RadarBarChart.prototype.pointSlot = function pointSlot (categorySlot, valueSlot) {
        var slot = categorySlot.clone();
        var y = categorySlot.center.y;

        slot.radius = y - valueSlot.y1;
        slot.innerRadius = y - valueSlot.y2;

        return slot;
    };

    RadarBarChart.prototype.reflowPoint = function reflowPoint (point, pointSlot) {
        point.sector = pointSlot;
        point.reflow();
    };

    RadarBarChart.prototype.createAnimation = function createAnimation () {
        this.options.animation.center = this.box.toRect().center();
        BarChart.prototype.createAnimation.call(this);
    };

    return RadarBarChart;
}(BarChart));

RadarBarChart.prototype.reflow = CategoricalChart.prototype.reflow;

setDefaultOptions(RadarBarChart, {
    clip: false,
    limitPoints: false,
    animation: {
        type: "pie"
    }
});

export default RadarBarChart;