import { drawing as draw } from '@progress/kendo-drawing';

import { FADEIN } from '../constants';

import { setDefaultOptions } from '../../common';

var FadeInAnimation = (function (superclass) {
    function FadeInAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) FadeInAnimation.__proto__ = superclass;
    FadeInAnimation.prototype = Object.create( superclass && superclass.prototype );
    FadeInAnimation.prototype.constructor = FadeInAnimation;

    FadeInAnimation.prototype.setup = function setup () {
        this.fadeTo = this.element.opacity();
        this.element.opacity(0);
    };

    FadeInAnimation.prototype.step = function step (pos) {
        this.element.opacity(pos * this.fadeTo);
    };

    return FadeInAnimation;
}(draw.Animation));

setDefaultOptions(FadeInAnimation, {
    duration: 200,
    easing: "linear"
});

draw.AnimationFactory.current.register(FADEIN, FadeInAnimation);

export default FadeInAnimation;