import { drawing } from '@progress/kendo-drawing';
import { interpolateValue, setDefaultOptions } from '../../common';
import { X, Y } from '../../common/constants';
import { BAR_POINTER, LINEAR_SPEED, LINEAR } from '../constants';

class BarLinearPointerAnimation extends drawing.Animation {

    setup() {
        const options = this.options;
        const axis = this.axis = options.vertical ? Y : X;
        const to = this.to = options.newPoints[0][axis];
        const from = this.from = options.oldPoints[0][axis];

        if (options.duration !== 0) {
            options.duration = Math.max((Math.abs(to - from) / options.speed) * 1000, 1);
        }

        this._set(from);
    }

    step(pos) {
        const value = interpolateValue(this.from, this.to, pos);
        this._set(value);
    }

    _set(value) {
        const setter = "set" + this.axis.toUpperCase();
        const points = this.options.newPoints;

        points[0][setter](value);
        points[1][setter](value);
    }
}

setDefaultOptions(BarLinearPointerAnimation, {
    easing: LINEAR,
    speed: LINEAR_SPEED
});

drawing.AnimationFactory.current.register(BAR_POINTER, BarLinearPointerAnimation);

export default BarLinearPointerAnimation;