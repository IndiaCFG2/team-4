import { Class, setDefaultOptions, defined, deepExtend, limitValue } from '../common';
import { BLACK } from '../common/constants';

var Pointer = (function (Class) {
    function Pointer(scale, userOptions) {
        Class.call(this);

        var ref = scale.options;
        var min = ref.min;
        var max = ref.max;
        var options = this.options = deepExtend({}, this.options, userOptions);

        options.fill = options.color;

        this.scale = scale;

        if (defined(options.value)) {
            options.value = limitValue(options.value, min, max);
        } else {
            options.value = min;
        }
    }

    if ( Class ) Pointer.__proto__ = Class;
    Pointer.prototype = Object.create( Class && Class.prototype );
    Pointer.prototype.constructor = Pointer;

    Pointer.prototype.value = function value (newValue) {
        var options = this.options;
        var value = options.value;

        if (arguments.length === 0) {
            return value;
        }

        var ref = this.scale.options;
        var min = ref.min;
        var max = ref.max;

        options._oldValue = defined(options._oldValue) ? options.value : min;
        options.value = limitValue(newValue, min, max);

        if (this.elements) {
            this.repaint();
        }
    };

    return Pointer;
}(Class));

setDefaultOptions(Pointer, {
    color: BLACK
});

export default Pointer;