import { ChartElement } from '../../core';

import { setDefaultOptions } from '../../common';

import { forEach, forEachReverse } from './utils';

var RadarClusterLayout = (function (ChartElement) {
    function RadarClusterLayout(options) {
        ChartElement.call(this, options);

        this.forEach = options.rtl ? forEachReverse : forEach;
    }

    if ( ChartElement ) RadarClusterLayout.__proto__ = ChartElement;
    RadarClusterLayout.prototype = Object.create( ChartElement && ChartElement.prototype );
    RadarClusterLayout.prototype.constructor = RadarClusterLayout;

    RadarClusterLayout.prototype.reflow = function reflow (sector) {
        var ref = this;
        var options = ref.options;
        var children = ref.children;
        var gap = options.gap;
        var spacing = options.spacing;
        var count = children.length;
        var slots = count + gap + (spacing * (count - 1));
        var slotAngle = sector.angle / slots;
        var angle = sector.startAngle + slotAngle * (gap / 2);

        this.forEach(children, function (child) {
            var slotSector = sector.clone();
            slotSector.startAngle = angle;
            slotSector.angle = slotAngle;

            if (child.sector) {
                slotSector.radius = child.sector.radius;
            }

            child.reflow(slotSector);
            child.sector = slotSector;

            angle += slotAngle + (slotAngle * spacing);
        });
    };

    return RadarClusterLayout;
}(ChartElement));

setDefaultOptions(RadarClusterLayout, {
    gap: 1,
    spacing: 0
});

export default RadarClusterLayout;