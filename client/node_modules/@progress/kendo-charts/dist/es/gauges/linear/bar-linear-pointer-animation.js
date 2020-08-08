import { drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { X, Y } from '../../common/constants';
import { BAR_POINTER, LINEAR_SPEED, LINEAR } from '../constants';

var BarLinearPointerAnimation = (function (superclass) {
    function BarLinearPointerAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) BarLinearPointerAnimation.__proto__ = superclass;
    BarLinearPointerAnimation.prototype = Object.create( superclass && superclass.prototype );
    BarLinearPointerAnimation.prototype.constructor = BarLinearPointerAnimation;

    BarLinearPointerAnimation.prototype.setup = function setup () {
        var options = this.options;
        var axis = this.axis = options.vertical ? Y : X;
        var to = this.to = options.newPoints[0][axis];
        var from = this.from = options.oldPoints[0][axis];

        if (options.duration !== 0) {
            options.duration = Math.max((Math.abs(to - from) / options.speed) * 1000, 1);
        }

        this._set(from);
    };

    BarLinearPointerAnimation.prototype.step = function step (pos) {
        var value = interpolateValue(this.from, this.to, pos);
        this._set(value);
    };

    BarLinearPointerAnimation.prototype._set = function _set (value) {
        var setter = "set" + this.axis.toUpperCase();
        var points = this.options.newPoints;

        points[0][setter](value);
        points[1][setter](value);
    };

    return BarLinearPointerAnimation;
}(drawing.Animation));

setDefaultOptions(BarLinearPointerAnimation, {
    easing: LINEAR,
    speed: LINEAR_SPEED
});

drawing.AnimationFactory.current.register(BAR_POINTER, BarLinearPointerAnimation);

export default BarLinearPointerAnimation;