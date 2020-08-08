import { ChartElement, Box } from '../../core';

class RadarStackLayout extends ChartElement {
    reflow(sector) {
        const { options: { reverse }, children } = this;
        const childrenCount = children.length;
        const first = reverse ? childrenCount - 1 : 0;
        const step = reverse ? -1 : 1;

        this.box = new Box();

        for (let i = first; i >= 0 && i < childrenCount; i += step) {
            const childSector = children[i].sector;
            childSector.startAngle = sector.startAngle;
            childSector.angle = sector.angle;
        }
    }
}

export default RadarStackLayout;