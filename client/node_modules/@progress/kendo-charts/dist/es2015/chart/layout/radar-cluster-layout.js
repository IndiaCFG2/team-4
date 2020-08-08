import { ChartElement } from '../../core';

import { setDefaultOptions } from '../../common';

import { forEach, forEachReverse } from './utils';

class RadarClusterLayout extends ChartElement {
    constructor(options) {
        super(options);

        this.forEach = options.rtl ? forEachReverse : forEach;
    }

    reflow(sector) {
        const { options, children } = this;
        const { gap, spacing } = options;
        const count = children.length;
        const slots = count + gap + (spacing * (count - 1));
        const slotAngle = sector.angle / slots;
        let angle = sector.startAngle + slotAngle * (gap / 2);

        this.forEach(children, (child) => {
            const slotSector = sector.clone();
            slotSector.startAngle = angle;
            slotSector.angle = slotAngle;

            if (child.sector) {
                slotSector.radius = child.sector.radius;
            }

            child.reflow(slotSector);
            child.sector = slotSector;

            angle += slotAngle + (slotAngle * spacing);
        });
    }
}

setDefaultOptions(RadarClusterLayout, {
    gap: 1,
    spacing: 0
});

export default RadarClusterLayout;