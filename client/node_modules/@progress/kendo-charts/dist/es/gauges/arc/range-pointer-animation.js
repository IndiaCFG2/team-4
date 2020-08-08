import { drawing, Color } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions, round, limitValue } from '../../common';
import { ANGULAR_SPEED, LINEAR, RADIAL_RANGE_POINTER } from '../constants';

var MAX_DURATION = 800;

var RangePointerAnimation = (function (superclass) {
    function RangePointerAnimation(element, options) {
        superclass.call(this, element, options);

        var animationOptions = this.options;
        var duration = (Math.abs(animationOptions.newAngle - animationOptions.oldAngle) / animationOptions.duration) * 1000;
        animationOptions.duration = limitValue(duration, ANGULAR_SPEED, MAX_DURATION);

        var startColor = element.elements.options.get("stroke.color");
        var color = element.currentColor();
        if (startColor !== color) {
            this.startColor = new Color(startColor);
            this.color = new Color(color);
        }
    }

    if ( superclass ) RangePointerAnimation.__proto__ = superclass;
    RangePointerAnimation.prototype = Object.create( superclass && superclass.prototype );
    RangePointerAnimation.prototype.constructor = RangePointerAnimation;

    RangePointerAnimation.prototype.step = function step (pos) {
        var ref = this;
        var options = ref.options;
        var startColor = ref.startColor;
        var color = ref.color;
        var angle = interpolateValue(options.oldAngle, options.newAngle, pos);
        this.element.angle(angle);

        if (color) {
            var r = round(interpolateValue(startColor.r, color.r, pos));
            var g = round(interpolateValue(startColor.g, color.g, pos));
            var b = round(interpolateValue(startColor.b, color.b, pos));

            this.element.stroke(new Color(r, g, b).toHex());
        }
    };

    return RangePointerAnimation;
}(drawing.Animation));

setDefaultOptions(RangePointerAnimation, {
    easing: LINEAR,
    duration: ANGULAR_SPEED
});

drawing.AnimationFactory.current.register(RADIAL_RANGE_POINTER, RangePointerAnimation);

export default RangePointerAnimation;