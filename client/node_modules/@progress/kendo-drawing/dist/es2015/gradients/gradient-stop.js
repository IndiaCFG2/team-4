import defineOptionsAccessors from '../accessors/define-options-accessors';
import OptionsStore from '../core/options-store';
import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import { defined } from '../util';

class GradientStop extends Class {
    constructor(offset, color, opacity) {
        super();

        this.options = new OptionsStore({
            offset: offset,
            color: color,
            opacity: defined(opacity) ? opacity : 1
        });
        this.options.addObserver(this);
    }

    static create(arg) {
        if (defined(arg)) {
            let stop;
            if (arg instanceof GradientStop) {
                stop = arg;
            } else if (arg.length > 1) {
                stop = new GradientStop(arg[0], arg[1], arg[2]);
            } else {
                stop = new GradientStop(arg.offset, arg.color, arg.opacity);
            }

            return stop;
        }
    }
}

defineOptionsAccessors(GradientStop.prototype, [ "offset", "color", "opacity" ]);
ObserversMixin.extend(GradientStop.prototype);

export default GradientStop;
