import ScatterChart from '../scatter-charts/scatter-chart';

import { Point, Box } from '../../core';

import { setDefaultOptions } from '../../common';

class PolarScatterChart extends ScatterChart {
    pointSlot(slotX, slotY) {
        const valueRadius = slotX.center.y - slotY.y1;
        const slot = Point.onCircle(slotX.center, slotX.startAngle, valueRadius);

        return new Box(slot.x, slot.y, slot.x, slot.y);
    }
}

setDefaultOptions(PolarScatterChart, {
    clip: false
});

export default PolarScatterChart;