import { ChartElement, TextBox, Box } from '../../core';
import { FADEIN, INITIAL_ANIMATION_DURATION, INSIDE_END, INSIDE_BASE, OUTSIDE_END } from '../constants';

import { CENTER, TOP, BOTTOM, LEFT, RIGHT, X, Y, BLACK } from '../../common/constants';
import { getSpacing, setDefaultOptions } from '../../common';

class BarLabel extends ChartElement {
    constructor(content, options, pointData) {
        super(options);

        this.textBox = new TextBox(content, this.options, pointData);
        this.append(this.textBox);
    }

    createVisual() {
        this.textBox.options.noclip = this.options.noclip;
    }

    reflow(targetBox) {
        const options = this.options;
        const { vertical, aboveAxis } = options;
        const text = this.children[0];
        const textOptions = text.options;
        const box = text.box;
        const padding = text.options.padding;
        let labelBox = targetBox;

        textOptions.align = vertical ? CENTER : LEFT;
        textOptions.vAlign = vertical ? TOP : CENTER;

        if (options.position === INSIDE_END) {
            if (vertical) {
                textOptions.vAlign = TOP;

                if (!aboveAxis && box.height() < targetBox.height()) {
                    textOptions.vAlign = BOTTOM;
                }
            } else {
                textOptions.align = aboveAxis ? RIGHT : LEFT;
            }
        } else if (options.position === CENTER) {
            textOptions.vAlign = CENTER;
            textOptions.align = CENTER;
        } else if (options.position === INSIDE_BASE) {
            if (vertical) {
                textOptions.vAlign = aboveAxis ? BOTTOM : TOP;
            } else {
                textOptions.align = aboveAxis ? LEFT : RIGHT;
            }
        } else if (options.position === OUTSIDE_END) {
            if (vertical) {
                if (aboveAxis) {
                    labelBox = new Box(
                        targetBox.x1, targetBox.y1 - box.height(),
                        targetBox.x2, targetBox.y1
                    );
                } else {
                    labelBox = new Box(
                        targetBox.x1, targetBox.y2,
                        targetBox.x2, targetBox.y2 + box.height()
                    );
                }
            } else {
                textOptions.align = CENTER;
                if (aboveAxis) {
                    labelBox = new Box(
                        targetBox.x2, targetBox.y1,
                        targetBox.x2 + box.width(), targetBox.y2
                    );
                } else {
                    labelBox = new Box(
                        targetBox.x1 - box.width(), targetBox.y1,
                        targetBox.x1, targetBox.y2
                    );
                }
            }
        }

        if (!options.rotation) {
            if (vertical) {
                padding.left = padding.right =
                    (labelBox.width() - text.contentBox.width()) / 2;
            } else {
                padding.top = padding.bottom =
                    (labelBox.height() - text.contentBox.height()) / 2;
            }
        }

        text.reflow(labelBox);
    }

    alignToClipBox(clipBox) {
        const vertical = this.options.vertical;
        const field = vertical ? Y : X;
        const start = field + "1";
        const end = field + "2";
        const text = this.children[0];
        const parentBox = this.parent.box;

        if (parentBox[start] < clipBox[start] || clipBox[end] < parentBox[end]) {
            const targetBox = text.paddingBox.clone();
            targetBox[start] = Math.max(parentBox[start], clipBox[start]);
            targetBox[end] = Math.min(parentBox[end], clipBox[end]);

            this.reflow(targetBox);
        }
    }
}

setDefaultOptions(BarLabel, {
    position: OUTSIDE_END,
    margin: getSpacing(3),
    padding: getSpacing(4),
    color: BLACK,
    background: "",
    border: {
        width: 1,
        color: ""
    },
    aboveAxis: true,
    vertical: false,
    animation: {
        type: FADEIN,
        delay: INITIAL_ANIMATION_DURATION
    },
    zIndex: 2
});

export default BarLabel;