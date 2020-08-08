import { setDefaultOptions, deepExtend, isNumber } from '../../common';
import { ANGULAR_SPEED, RADIAL_RANGE_POINTER } from '../constants';
import Pointer from '../pointer';
import RangePointerAnimation from './range-pointer-animation';

var RangePointer = (function (Pointer) {
    function RangePointer () {
        Pointer.apply(this, arguments);
    }

    if ( Pointer ) RangePointer.__proto__ = Pointer;
    RangePointer.prototype = Object.create( Pointer && Pointer.prototype );
    RangePointer.prototype.constructor = RangePointer;

    RangePointer.prototype.repaint = function repaint () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var oldAngle = scale.slotAngle(options._oldValue);
        var newAngle = scale.slotAngle(options.value);

        if (this.animation) {
            this.animation.abort();
        }

        if (options.animation.transitions === false) {
            this.angle(newAngle);
            this.stroke(this.currentColor());
        } else {
            this.animation = new RangePointerAnimation(this, deepExtend(options.animation, {
                oldAngle: oldAngle,
                newAngle: newAngle
            }));

            this.animation.play();
        }
    };

    RangePointer.prototype.angle = function angle (value) {
        var geometry = this.elements.geometry();
        if (this.scale.options.reverse) {
            geometry.setStartAngle(value);
        } else {
            geometry.setEndAngle(value);
        }
        this.scale.placeholderRangeAngle(value);
    };

    RangePointer.prototype.stroke = function stroke (value) {
        this.elements.stroke(value);
    };

    RangePointer.prototype.render = function render () {
        if (this.elements) {
            return;
        }

        var ref = this;
        var scale = ref.scale;
        var options = ref.options;

        if (options.animation !== false) {
            deepExtend(options.animation, {
                startAngle: 0,
                center: scale.arc.center,
                reverse: scale.options.reverse
            });
        }

        this.elements = scale.addRange(scale.options.min, this.options.value, {
            color: this.currentColor(),
            opacity: options.opacity,
            lineCap: scale.options.rangeLineCap
        });
    };

    RangePointer.prototype.currentColor = function currentColor () {
        var ref = this.scale.options;
        var min = ref.min;
        var max = ref.max;
        var ref$1 = this.options;
        var colors = ref$1.colors;
        var color = ref$1.color;
        var value = ref$1.value;
        var currentValue = isNumber(value) ? value : min;

        if (colors) {
            for (var idx = 0; idx < colors.length; idx++) {
                var ref$2 = colors[idx];
                var rangeColor = ref$2.color;
                var from = ref$2.from; if ( from === void 0 ) from = min;
                var to = ref$2.to; if ( to === void 0 ) to = max;

                if (from <= currentValue && currentValue <= to) {
                    return rangeColor;
                }
            }
        }

        return color;
    };

    RangePointer.prototype.reflow = function reflow () {
        this.render();

        this.bbox = this.elements.bbox();
    };

    return RangePointer;
}(Pointer));

setDefaultOptions(RangePointer, {
    animation: {
        type: RADIAL_RANGE_POINTER,
        duration: ANGULAR_SPEED
    }
});

export default RangePointer;
