import { drawing, Color } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions, round, limitValue } from '../../common';
import { ANGULAR_SPEED, LINEAR, RADIAL_RANGE_POINTER } from '../constants';

const MAX_DURATION = 800;

class RangePointerAnimation extends drawing.Animation {
    constructor(element, options) {
        super(element, options);

        const animationOptions = this.options;
        const duration = (Math.abs(animationOptions.newAngle - animationOptions.oldAngle) / animationOptions.duration) * 1000;
        animationOptions.duration = limitValue(duration, ANGULAR_SPEED, MAX_DURATION);

        const startColor = element.elements.options.get("stroke.color");
        const color = element.currentColor();
        if (startColor !== color) {
            this.startColor = new Color(startColor);
            this.color = new Color(color);
        }
    }

    step(pos) {
        const { options, startColor, color } = this;
        const angle = interpolateValue(options.oldAngle, options.newAngle, pos);
        this.element.angle(angle);

        if (color) {
            const r = round(interpolateValue(startColor.r, color.r, pos));
            const g = round(interpolateValue(startColor.g, color.g, pos));
            const b = round(interpolateValue(startColor.b, color.b, pos));

            this.element.stroke(new Color(r, g, b).toHex());
        }
    }
}

setDefaultOptions(RangePointerAnimation, {
    easing: LINEAR,
    duration: ANGULAR_SPEED
});

drawing.AnimationFactory.current.register(RADIAL_RANGE_POINTER, RangePointerAnimation);

export default RangePointerAnimation;