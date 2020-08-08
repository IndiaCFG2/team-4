import { geometry, drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { ANGULAR_SPEED, LINEAR, RADIAL_POINTER } from '../constants';

var RadialPointerAnimation = (function (superclass) {
    function RadialPointerAnimation(element, options) {
        superclass.call(this, element, options);

        var animationOptions = this.options;

        animationOptions.duration = Math.max((Math.abs(animationOptions.newAngle - animationOptions.oldAngle) / animationOptions.duration) * 1000, 1);
    }

    if ( superclass ) RadialPointerAnimation.__proto__ = superclass;
    RadialPointerAnimation.prototype = Object.create( superclass && superclass.prototype );
    RadialPointerAnimation.prototype.constructor = RadialPointerAnimation;

    RadialPointerAnimation.prototype.step = function step (pos) {
        var options = this.options;
        var angle = interpolateValue(options.oldAngle, options.newAngle, pos);

        this.element.transform(geometry.transform().rotate(angle, options.center));
    };

    return RadialPointerAnimation;
}(drawing.Animation));

setDefaultOptions(RadialPointerAnimation, {
    easing: LINEAR,
    duration: ANGULAR_SPEED
});

drawing.AnimationFactory.current.register(RADIAL_POINTER, RadialPointerAnimation);

export default RadialPointerAnimation;