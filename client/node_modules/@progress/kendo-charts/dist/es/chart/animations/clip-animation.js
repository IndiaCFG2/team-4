import { drawing as draw } from '@progress/kendo-drawing';

import { INITIAL_ANIMATION_DURATION } from '../constants';

import { interpolateValue, setDefaultOptions } from '../../common';

var ClipAnimation = (function (superclass) {
    function ClipAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) ClipAnimation.__proto__ = superclass;
    ClipAnimation.prototype = Object.create( superclass && superclass.prototype );
    ClipAnimation.prototype.constructor = ClipAnimation;

    ClipAnimation.prototype.setup = function setup () {
        this._setEnd(this.options.box.x1);
    };

    ClipAnimation.prototype.step = function step (pos) {
        var box = this.options.box;
        this._setEnd(interpolateValue(box.x1, box.x2, pos));
    };

    ClipAnimation.prototype._setEnd = function _setEnd (x) {
        var element = this.element;
        var segments = element.segments;
        var topRight = segments[1].anchor();
        var bottomRight = segments[2].anchor();

        element.suspend();
        topRight.setX(x);
        element.resume();
        bottomRight.setX(x);
    };

    return ClipAnimation;
}(draw.Animation));

setDefaultOptions(ClipAnimation, {
    duration: INITIAL_ANIMATION_DURATION
});

draw.AnimationFactory.current.register("clip", ClipAnimation);

export default ClipAnimation;