import { ChartElement, Box } from '../../core';

import { X, Y } from '../../common/constants';
import { setDefaultOptions } from '../../common';

class StackWrap extends ChartElement {
    reflow(targetBox) {
        const positionAxis = this.options.vertical ? X : Y;
        const children = this.children;
        const childrenCount = children.length;
        let box = this.box = new Box();

        for (let i = 0; i < childrenCount; i++) {
            const currentChild = children[i];

            if (currentChild.visible !== false) {
                const childBox = currentChild.box.clone();
                childBox.snapTo(targetBox, positionAxis);

                if (i === 0) {
                    box = this.box = childBox.clone();
                }

                currentChild.reflow(childBox);
                box.wrap(childBox);
            }
        }
    }
}

setDefaultOptions(StackWrap, {
    vertical: true
});

export default StackWrap;