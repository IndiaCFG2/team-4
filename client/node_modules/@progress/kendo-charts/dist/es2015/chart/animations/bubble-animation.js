import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { START_SCALE, BUBBLE } from '../constants';

import { setDefaultOptions } from '../../common';

class BubbleAnimation extends draw.Animation {
    setup() {
        const center = this.center = this.element.bbox().center();
        this.element.transform(geom.transform()
            .scale(START_SCALE, START_SCALE, center)
        );
    }

    step(pos) {
        this.element.transform(geom.transform()
            .scale(pos, pos, this.center)
        );
    }
}

setDefaultOptions(BubbleAnimation, {
    easing: "easeOutElastic"
});

draw.AnimationFactory.current.register(BUBBLE, BubbleAnimation);

export default BubbleAnimation;