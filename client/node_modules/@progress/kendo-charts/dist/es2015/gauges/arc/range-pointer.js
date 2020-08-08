import { setDefaultOptions, deepExtend, isNumber } from '../../common';
import { ANGULAR_SPEED, RADIAL_RANGE_POINTER } from '../constants';
import Pointer from '../pointer';
import RangePointerAnimation from './range-pointer-animation';

class RangePointer extends Pointer {

    repaint() {
        const { scale, options } = this;
        const oldAngle = scale.slotAngle(options._oldValue);
        const newAngle = scale.slotAngle(options.value);

        if (this.animation) {
            this.animation.abort();
        }

        if (options.animation.transitions === false) {
            this.angle(newAngle);
            this.stroke(this.currentColor());
        } else {
            this.animation = new RangePointerAnimation(this, deepExtend(options.animation, {
                oldAngle: oldAngle,
                newAngle: newAngle
            }));

            this.animation.play();
        }
    }

    angle(value) {
        const geometry = this.elements.geometry();
        if (this.scale.options.reverse) {
            geometry.setStartAngle(value);
        } else {
            geometry.setEndAngle(value);
        }
        this.scale.placeholderRangeAngle(value);
    }

    stroke(value) {
        this.elements.stroke(value);
    }

    render() {
        if (this.elements) {
            return;
        }

        const { scale, options } = this;

        if (options.animation !== false) {
            deepExtend(options.animation, {
                startAngle: 0,
                center: scale.arc.center,
                reverse: scale.options.reverse
            });
        }

        this.elements = scale.addRange(scale.options.min, this.options.value, {
            color: this.currentColor(),
            opacity: options.opacity,
            lineCap: scale.options.rangeLineCap
        });
    }

    currentColor() {
        const { min, max } = this.scale.options;
        const { colors, color, value } = this.options;
        const currentValue = isNumber(value) ? value : min;

        if (colors) {
            for (let idx = 0; idx < colors.length; idx++) {
                const { color: rangeColor, from = min, to = max } = colors[idx];

                if (from <= currentValue && currentValue <= to) {
                    return rangeColor;
                }
            }
        }

        return color;
    }

    reflow() {
        this.render();

        this.bbox = this.elements.bbox();
    }
}

setDefaultOptions(RangePointer, {
    animation: {
        type: RADIAL_RANGE_POINTER,
        duration: ANGULAR_SPEED
    }
});

export default RangePointer;
