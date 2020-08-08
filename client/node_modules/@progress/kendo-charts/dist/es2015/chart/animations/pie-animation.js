import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { START_SCALE, INITIAL_ANIMATION_DURATION, PIE } from '../constants';

import { setDefaultOptions } from '../../common';

class PieAnimation extends draw.Animation {
    setup() {
        this.element.transform(geom.transform()
            .scale(START_SCALE, START_SCALE, this.options.center)
        );
    }

    step(pos) {
        this.element.transform(geom.transform()
            .scale(pos, pos, this.options.center)
        );
    }
}

setDefaultOptions(PieAnimation, {
    easing: "easeOutElastic",
    duration: INITIAL_ANIMATION_DURATION
});

draw.AnimationFactory.current.register(PIE, PieAnimation);

export default PieAnimation;