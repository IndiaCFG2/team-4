import { SharedTooltip as ChartSharedTooltip } from '../chart';
import { Point } from '../core';
const TOP_OFFSET = -2;

class SharedTooltip extends ChartSharedTooltip {
    _slotAnchor(coords, slot) {
        const axis = this.plotArea.categoryAxis;
        const vertical = axis.options.vertical;
        const align = vertical ? {
            horizontal: "left",
            vertical: "center"
        } : {
            horizontal: "center",
            vertical: "bottom"
        };

        let point;

        if (vertical) {
            point = new Point(this.plotArea.box.x2, slot.center().y);
        } else {
            point = new Point(slot.center().x, TOP_OFFSET);
        }

        return {
            point: point,
            align: align
        };
    }

    _defaultAnchor(point, slot) {
        return this._slotAnchor({}, slot);
    }
}

export default SharedTooltip;