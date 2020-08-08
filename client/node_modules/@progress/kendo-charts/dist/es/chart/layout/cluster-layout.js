import { ChartElement } from '../../core';

import { X, Y } from '../../common/constants';
import { setDefaultOptions } from '../../common';
import { forEach, forEachReverse } from './utils';

var ClusterLayout = (function (ChartElement) {
    function ClusterLayout(options) {
        ChartElement.call(this, options);

        this.forEach = options.rtl ? forEachReverse : forEach;
    }

    if ( ChartElement ) ClusterLayout.__proto__ = ChartElement;
    ClusterLayout.prototype = Object.create( ChartElement && ChartElement.prototype );
    ClusterLayout.prototype.constructor = ClusterLayout;

    ClusterLayout.prototype.reflow = function reflow (box) {
        var ref = this.options;
        var vertical = ref.vertical;
        var gap = ref.gap;
        var spacing = ref.spacing;
        var children = this.children;
        var count = children.length;
        var axis = vertical ? Y : X;
        var slots = count + gap + (spacing * (count - 1));
        var slotSize = (vertical ? box.height() : box.width()) / slots;
        var position = box[axis + 1] + slotSize * (gap / 2);

        this.forEach(children, function (child, idx) {
            var childBox = (child.box || box).clone();

            childBox[axis + 1] = position;
            childBox[axis + 2] = position + slotSize;

            child.reflow(childBox);
            if (idx < count - 1) {
                position += (slotSize * spacing);
            }

            position += slotSize;
        });
    };

    return ClusterLayout;
}(ChartElement));

setDefaultOptions(ClusterLayout, {
    vertical: false,
    gap: 0,
    spacing: 0
});

export default ClusterLayout;