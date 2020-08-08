import { setDefaultOptions, deepExtend, defined, getSpacing } from '../../common';
import { Box } from '../../core';
import { BLACK } from '../../common/constants';
import { BAR_POINTER } from '../constants';
import Pointer from '../pointer';

class LinearPointer extends Pointer {
    constructor(scale, options) {
        super(scale, options);

        this.options = deepExtend({
            track: {
                visible: defined(options.track)
            }
        }, this.options);
    }

    reflow() {
        const { options, scale } = this;
        const { mirror, vertical } = scale.options;
        const scaleLine = scale.lineBox();
        const trackSize = options.track.size || options.size;
        const pointerHalfSize = options.size / 2;
        const margin = getSpacing(options.margin);
        let space = vertical ?
                 margin[mirror ? "left" : "right"] :
                 margin[mirror ? "bottom" : "top"];
        let pointerBox, pointerRangeBox, trackBox;

        space = mirror ? -space : space;

        if (vertical) {
            trackBox = new Box(
                scaleLine.x1 + space, scaleLine.y1,
                scaleLine.x1 + space, scaleLine.y2);

            if (mirror) {
                trackBox.x1 -= trackSize;
            } else {
                trackBox.x2 += trackSize;
            }

            if (options.shape !== BAR_POINTER) {
                pointerRangeBox = new Box(
                    scaleLine.x2 + space, scaleLine.y1 - pointerHalfSize,
                    scaleLine.x2 + space, scaleLine.y2 + pointerHalfSize
                );
                pointerBox = pointerRangeBox;
            }
        } else {
            trackBox = new Box(
                scaleLine.x1, scaleLine.y1 - space,
                scaleLine.x2, scaleLine.y1 - space);

            if (mirror) {
                trackBox.y2 += trackSize;
            } else {
                trackBox.y1 -= trackSize;
            }

            if (options.shape !== BAR_POINTER) {
                pointerRangeBox = new Box(
                    scaleLine.x1 - pointerHalfSize, scaleLine.y1 - space,
                    scaleLine.x2 + pointerHalfSize, scaleLine.y1 - space
                );
                pointerBox = pointerRangeBox;
            }
        }

        this.trackBox = trackBox;
        this.pointerRangeBox = pointerRangeBox;
        this.box = pointerBox || trackBox.clone().pad(options.border.width);
    }

    getElementOptions() {
        const options = this.options;

        return {
            fill: {
                color: options.color,
                opacity: options.opacity
            },
            stroke: defined(options.border) ? {
                color: options.border.width ? options.border.color || options.color : "",
                width: options.border.width,
                dashType: options.border.dashType,
                opacity: options.opacity
            } : null
        };
    }

    _margin() {
        const { scale, options } = this;
        const { mirror, vertical } = scale.options;
        const margin = getSpacing(options.margin);

        const space = vertical ?
            margin[mirror ? "left" : "right"] :
            margin[mirror ? "bottom" : "top"];

        return space;
    }
}

setDefaultOptions(LinearPointer, {
    shape: BAR_POINTER,

    track: {
        border: {
            width: 1
        }
    },

    color: BLACK,
    border: {
        width: 1
    },
    opacity: 1,

    margin: getSpacing(3),
    animation: {
        type: BAR_POINTER
    },
    visible: true
});

export default LinearPointer;