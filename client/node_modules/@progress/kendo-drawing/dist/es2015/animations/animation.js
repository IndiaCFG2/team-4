import * as easingFunctions from './easing-functions';
import { limitValue } from '../util';
import { animationFrame, Class } from '../common';
import AnimationFactory from './animation-factory';

const now = Date.now || function() {
    return new Date().getTime();
};

class Animation extends Class {
    constructor(element, options) {
        super();

        this.options = Object.assign({}, this.options, options);
        this.element = element;
    }

    setup() {}
    step() {}

    play() {
        const options = this.options;
        const { duration, delay = 0 } = options;
        const easing = easingFunctions[options.easing];
        const start = now() + delay;
        const finish = start + duration;

        if (duration === 0) {
            this.step(1);
            this.abort();
        } else {
            setTimeout(() => {
                const loop = () => {
                    if (this._stopped) {
                        return;
                    }

                    const wallTime = now();

                    const time = limitValue(wallTime - start, 0, duration);
                    const position = time / duration;
                    const easingPosition = easing(position, time, 0, 1, duration);

                    this.step(easingPosition);

                    if (wallTime < finish) {
                        animationFrame(loop);
                    } else {
                        this.abort();
                    }
                };

                loop();
            }, delay);
        }
    }

    abort() {
        this._stopped = true;
    }

    destroy() {
        this.abort();
    }
}

Animation.prototype.options = {
    duration: 500,
    easing: "swing"
};

Animation.create = function(type, element, options) {
    return AnimationFactory.current.create(type, element, options);
};

export default Animation;
