import { Class, setDefaultOptions, defined, deepExtend, limitValue } from '../common';
import { BLACK } from '../common/constants';

class Pointer extends Class {
    constructor(scale, userOptions) {
        super();

        const { min, max } = scale.options;
        const options = this.options = deepExtend({}, this.options, userOptions);

        options.fill = options.color;

        this.scale = scale;

        if (defined(options.value)) {
            options.value = limitValue(options.value, min, max);
        } else {
            options.value = min;
        }
    }

    value(newValue) {
        const options = this.options;
        const value = options.value;

        if (arguments.length === 0) {
            return value;
        }

        const { min, max } = this.scale.options;

        options._oldValue = defined(options._oldValue) ? options.value : min;
        options.value = limitValue(newValue, min, max);

        if (this.elements) {
            this.repaint();
        }
    }
}

setDefaultOptions(Pointer, {
    color: BLACK
});

export default Pointer;