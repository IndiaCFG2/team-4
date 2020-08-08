import { ChartElement } from '../../core';

import { X, Y } from '../../common/constants';
import { setDefaultOptions } from '../../common';
import { forEach, forEachReverse } from './utils';

class ClusterLayout extends ChartElement {
    constructor(options) {
        super(options);

        this.forEach = options.rtl ? forEachReverse : forEach;
    }

    reflow(box) {
        const { vertical, gap, spacing } = this.options;
        const children = this.children;
        const count = children.length;
        const axis = vertical ? Y : X;
        const slots = count + gap + (spacing * (count - 1));
        const slotSize = (vertical ? box.height() : box.width()) / slots;
        let position = box[axis + 1] + slotSize * (gap / 2);

        this.forEach(children, (child, idx) => {
            const childBox = (child.box || box).clone();

            childBox[axis + 1] = position;
            childBox[axis + 2] = position + slotSize;

            child.reflow(childBox);
            if (idx < count - 1) {
                position += (slotSize * spacing);
            }

            position += slotSize;
        });
    }
}

setDefaultOptions(ClusterLayout, {
    vertical: false,
    gap: 0,
    spacing: 0
});

export default ClusterLayout;