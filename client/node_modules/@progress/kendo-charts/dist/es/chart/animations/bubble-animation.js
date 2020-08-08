import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { START_SCALE, BUBBLE } from '../constants';

import { setDefaultOptions } from '../../common';

var BubbleAnimation = (function (superclass) {
    function BubbleAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) BubbleAnimation.__proto__ = superclass;
    BubbleAnimation.prototype = Object.create( superclass && superclass.prototype );
    BubbleAnimation.prototype.constructor = BubbleAnimation;

    BubbleAnimation.prototype.setup = function setup () {
        var center = this.center = this.element.bbox().center();
        this.element.transform(geom.transform()
            .scale(START_SCALE, START_SCALE, center)
        );
    };

    BubbleAnimation.prototype.step = function step (pos) {
        this.element.transform(geom.transform()
            .scale(pos, pos, this.center)
        );
    };

    return BubbleAnimation;
}(draw.Animation));

setDefaultOptions(BubbleAnimation, {
    easing: "easeOutElastic"
});

draw.AnimationFactory.current.register(BUBBLE, BubbleAnimation);

export default BubbleAnimation;