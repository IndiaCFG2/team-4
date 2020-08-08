import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { START_SCALE, INITIAL_ANIMATION_DURATION, PIE } from '../constants';

import { setDefaultOptions } from '../../common';

var PieAnimation = (function (superclass) {
    function PieAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) PieAnimation.__proto__ = superclass;
    PieAnimation.prototype = Object.create( superclass && superclass.prototype );
    PieAnimation.prototype.constructor = PieAnimation;

    PieAnimation.prototype.setup = function setup () {
        this.element.transform(geom.transform()
            .scale(START_SCALE, START_SCALE, this.options.center)
        );
    };

    PieAnimation.prototype.step = function step (pos) {
        this.element.transform(geom.transform()
            .scale(pos, pos, this.options.center)
        );
    };

    return PieAnimation;
}(draw.Animation));

setDefaultOptions(PieAnimation, {
    easing: "easeOutElastic",
    duration: INITIAL_ANIMATION_DURATION
});

draw.AnimationFactory.current.register(PIE, PieAnimation);

export default PieAnimation;