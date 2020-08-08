import BarChart from '../bar-chart/bar-chart';
import RadarSegment from './radar-segment';
import RadarClusterLayout from '../layout/radar-cluster-layout';
import RadarStackLayout from '../layout/radar-stack-layout';
import CategoricalChart from '../categorical-chart';

import { setDefaultOptions } from '../../common';

class RadarBarChart extends BarChart {
    pointType() {
        return RadarSegment;
    }

    clusterType() {
        return RadarClusterLayout;
    }

    stackType() {
        return RadarStackLayout;
    }

    categorySlot(categoryAxis, categoryIx) {
        return categoryAxis.getSlot(categoryIx);
    }

    pointSlot(categorySlot, valueSlot) {
        const slot = categorySlot.clone();
        const y = categorySlot.center.y;

        slot.radius = y - valueSlot.y1;
        slot.innerRadius = y - valueSlot.y2;

        return slot;
    }

    reflowPoint(point, pointSlot) {
        point.sector = pointSlot;
        point.reflow();
    }

    createAnimation() {
        this.options.animation.center = this.box.toRect().center();
        super.createAnimation();
    }
}

RadarBarChart.prototype.reflow = CategoricalChart.prototype.reflow;

setDefaultOptions(RadarBarChart, {
    clip: false,
    limitPoints: false,
    animation: {
        type: "pie"
    }
});

export default RadarBarChart;