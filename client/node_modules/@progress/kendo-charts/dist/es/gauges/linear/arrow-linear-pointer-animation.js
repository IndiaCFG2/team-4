import { geometry, drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { ARROW_POINTER, LINEAR_SPEED, LINEAR } from '../constants';

var ArrowLinearPointerAnimation = (function (superclass) {
    function ArrowLinearPointerAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) ArrowLinearPointerAnimation.__proto__ = superclass;
    ArrowLinearPointerAnimation.prototype = Object.create( superclass && superclass.prototype );
    ArrowLinearPointerAnimation.prototype.constructor = ArrowLinearPointerAnimation;

    ArrowLinearPointerAnimation.prototype.setup = function setup () {
        var options = this.options;
        var margin = options.margin;
        var from = options.from;
        var to = options.to;
        var vertical = options.vertical;
        var axis = vertical ? "x1" : "y1";

        if (options.mirror === vertical) {
            from[axis] -= margin; to[axis] -= margin;
        } else {
            from[axis] += margin; to[axis] += margin;
        }

        var fromScale = this.fromScale = new geometry.Point(from.x1, from.y1);
        var toScale = this.toScale = new geometry.Point(to.x1, to.y1);

        if (options.duration !== 0) {
            options.duration = Math.max((fromScale.distanceTo(toScale) / options.duration) * 1000, 1);
        }
    };

    ArrowLinearPointerAnimation.prototype.step = function step (pos) {
        var translateX = interpolateValue(this.fromScale.x, this.toScale.x, pos);
        var translateY = interpolateValue(this.fromScale.y, this.toScale.y, pos);

        this.element.transform(geometry.transform().translate(translateX, translateY));
    };

    return ArrowLinearPointerAnimation;
}(drawing.Animation));

setDefaultOptions(ArrowLinearPointerAnimation, {
    easing: LINEAR,
    duration: LINEAR_SPEED
});

drawing.AnimationFactory.current.register(ARROW_POINTER, ArrowLinearPointerAnimation);

export default ArrowLinearPointerAnimation;