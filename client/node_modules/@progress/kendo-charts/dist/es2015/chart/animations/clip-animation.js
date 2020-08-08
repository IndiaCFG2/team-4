import { drawing as draw } from '@progress/kendo-drawing';

import { INITIAL_ANIMATION_DURATION } from '../constants';

import { interpolateValue, setDefaultOptions } from '../../common';

class ClipAnimation extends draw.Animation {
    setup() {
        this._setEnd(this.options.box.x1);
    }

    step(pos) {
        const box = this.options.box;
        this._setEnd(interpolateValue(box.x1, box.x2, pos));
    }

    _setEnd(x) {
        const element = this.element;
        const segments = element.segments;
        const topRight = segments[1].anchor();
        const bottomRight = segments[2].anchor();

        element.suspend();
        topRight.setX(x);
        element.resume();
        bottomRight.setX(x);
    }
}

setDefaultOptions(ClipAnimation, {
    duration: INITIAL_ANIMATION_DURATION
});

draw.AnimationFactory.current.register("clip", ClipAnimation);

export default ClipAnimation;