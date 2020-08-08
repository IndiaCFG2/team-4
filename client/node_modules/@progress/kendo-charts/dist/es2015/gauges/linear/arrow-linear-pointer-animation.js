import { geometry, drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { ARROW_POINTER, LINEAR_SPEED, LINEAR } from '../constants';

class ArrowLinearPointerAnimation extends drawing.Animation {

    setup() {
        const options = this.options;
        const { margin, from, to, vertical } = options;
        const axis = vertical ? "x1" : "y1";

        if (options.mirror === vertical) {
            from[axis] -= margin; to[axis] -= margin;
        } else {
            from[axis] += margin; to[axis] += margin;
        }

        const fromScale = this.fromScale = new geometry.Point(from.x1, from.y1);
        const toScale = this.toScale = new geometry.Point(to.x1, to.y1);

        if (options.duration !== 0) {
            options.duration = Math.max((fromScale.distanceTo(toScale) / options.duration) * 1000, 1);
        }
    }

    step(pos) {
        const translateX = interpolateValue(this.fromScale.x, this.toScale.x, pos);
        const translateY = interpolateValue(this.fromScale.y, this.toScale.y, pos);

        this.element.transform(geometry.transform().translate(translateX, translateY));
    }
}

setDefaultOptions(ArrowLinearPointerAnimation, {
    easing: LINEAR,
    duration: LINEAR_SPEED
});

drawing.AnimationFactory.current.register(ARROW_POINTER, ArrowLinearPointerAnimation);

export default ArrowLinearPointerAnimation;