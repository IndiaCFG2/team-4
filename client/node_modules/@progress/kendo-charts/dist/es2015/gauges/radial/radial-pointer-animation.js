import { geometry, drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { ANGULAR_SPEED, LINEAR, RADIAL_POINTER } from '../constants';

class RadialPointerAnimation extends drawing.Animation {
    constructor(element, options) {
        super(element, options);

        const animationOptions = this.options;

        animationOptions.duration = Math.max((Math.abs(animationOptions.newAngle - animationOptions.oldAngle) / animationOptions.duration) * 1000, 1);
    }

    step(pos) {
        const options = this.options;
        const angle = interpolateValue(options.oldAngle, options.newAngle, pos);

        this.element.transform(geometry.transform().rotate(angle, options.center));
    }
}

setDefaultOptions(RadialPointerAnimation, {
    easing: LINEAR,
    duration: ANGULAR_SPEED
});

drawing.AnimationFactory.current.register(RADIAL_POINTER, RadialPointerAnimation);

export default RadialPointerAnimation;