import { drawing as draw } from '@progress/kendo-drawing';

import { FADEIN } from '../constants';

import { setDefaultOptions } from '../../common';

class FadeInAnimation extends draw.Animation {
    setup() {
        this.fadeTo = this.element.opacity();
        this.element.opacity(0);
    }

    step(pos) {
        this.element.opacity(pos * this.fadeTo);
    }
}

setDefaultOptions(FadeInAnimation, {
    duration: 200,
    easing: "linear"
});

draw.AnimationFactory.current.register(FADEIN, FadeInAnimation);

export default FadeInAnimation;