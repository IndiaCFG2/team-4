import ScatterChart from '../scatter-charts/scatter-chart';

import { Point, Box } from '../../core';

import { setDefaultOptions } from '../../common';

var PolarScatterChart = (function (ScatterChart) {
    function PolarScatterChart () {
        ScatterChart.apply(this, arguments);
    }

    if ( ScatterChart ) PolarScatterChart.__proto__ = ScatterChart;
    PolarScatterChart.prototype = Object.create( ScatterChart && ScatterChart.prototype );
    PolarScatterChart.prototype.constructor = PolarScatterChart;

    PolarScatterChart.prototype.pointSlot = function pointSlot (slotX, slotY) {
        var valueRadius = slotX.center.y - slotY.y1;
        var slot = Point.onCircle(slotX.center, slotX.startAngle, valueRadius);

        return new Box(slot.x, slot.y, slot.x, slot.y);
    };

    return PolarScatterChart;
}(ScatterChart));

setDefaultOptions(PolarScatterChart, {
    clip: false
});

export default PolarScatterChart;