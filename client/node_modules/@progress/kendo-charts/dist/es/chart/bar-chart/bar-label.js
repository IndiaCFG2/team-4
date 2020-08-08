import { ChartElement, TextBox, Box } from '../../core';
import { FADEIN, INITIAL_ANIMATION_DURATION, INSIDE_END, INSIDE_BASE, OUTSIDE_END } from '../constants';

import { CENTER, TOP, BOTTOM, LEFT, RIGHT, X, Y, BLACK } from '../../common/constants';
import { getSpacing, setDefaultOptions } from '../../common';

var BarLabel = (function (ChartElement) {
    function BarLabel(content, options, pointData) {
        ChartElement.call(this, options);

        this.textBox = new TextBox(content, this.options, pointData);
        this.append(this.textBox);
    }

    if ( ChartElement ) BarLabel.__proto__ = ChartElement;
    BarLabel.prototype = Object.create( ChartElement && ChartElement.prototype );
    BarLabel.prototype.constructor = BarLabel;

    BarLabel.prototype.createVisual = function createVisual () {
        this.textBox.options.noclip = this.options.noclip;
    };

    BarLabel.prototype.reflow = function reflow (targetBox) {
        var options = this.options;
        var vertical = options.vertical;
        var aboveAxis = options.aboveAxis;
        var text = this.children[0];
        var textOptions = text.options;
        var box = text.box;
        var padding = text.options.padding;
        var labelBox = targetBox;

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
    };

    BarLabel.prototype.alignToClipBox = function alignToClipBox (clipBox) {
        var vertical = this.options.vertical;
        var field = vertical ? Y : X;
        var start = field + "1";
        var end = field + "2";
        var text = this.children[0];
        var parentBox = this.parent.box;

        if (parentBox[start] < clipBox[start] || clipBox[end] < parentBox[end]) {
            var targetBox = text.paddingBox.clone();
            targetBox[start] = Math.max(parentBox[start], clipBox[start]);
            targetBox[end] = Math.min(parentBox[end], clipBox[end]);

            this.reflow(targetBox);
        }
    };

    return BarLabel;
}(ChartElement));

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