import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { deepExtend, defined } from '../../common';
import { ARROW_POINTER } from '../constants';
import LinearPointer from './linear-pointer';
import ArrowLinearPointerAnimation from './arrow-linear-pointer-animation';

var Point = geo.Point;
var Path = drawing.Path;

var ArrowLinearPointer = (function (LinearPointer) {
    function ArrowLinearPointer(scale, options) {
        LinearPointer.call(this, scale, options);

        if (!defined(this.options.size)) {
            this.options.size = this.scale.options.majorTicks.size * 0.6;
        }
    }

    if ( LinearPointer ) ArrowLinearPointer.__proto__ = LinearPointer;
    ArrowLinearPointer.prototype = Object.create( LinearPointer && LinearPointer.prototype );
    ArrowLinearPointer.prototype.constructor = ArrowLinearPointer;

    ArrowLinearPointer.prototype.pointerShape = function pointerShape () {
        var ref = this;
        var scale = ref.scale;
        var size = ref.options.size;
        var halfSize = size / 2;
        var sign = (scale.options.mirror ? -1 : 1);
        var shape;

        if (scale.options.vertical) {
            shape = [
                new Point(0, 0 - halfSize), new Point(0 - sign * size, 0), new Point(0, 0 + halfSize)
            ];
        } else {
            shape = [
                new Point(0 - halfSize, 0), new Point(0, 0 + sign * size), new Point(0 + halfSize, 0)
            ];
        }

        return shape;
    };

    ArrowLinearPointer.prototype.repaint = function repaint () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var animation = new ArrowLinearPointerAnimation(this.elements, deepExtend(options.animation, {
            vertical: scale.options.vertical,
            mirror: scale.options.mirror,
            margin: this._margin(options.margin),
            from: scale.getSlot(options._oldValue),
            to: scale.getSlot(options.value)
        }));

        if (options.animation.transitions === false) {
            animation.options.duration = 0;
        }

        animation.setup();
        animation.play();
    };

    ArrowLinearPointer.prototype.render = function render () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var elementOptions = this.getElementOptions();
        var shape = this.pointerShape(options.value);

        options.animation.type = ARROW_POINTER;

        var elements = new Path({
            stroke: elementOptions.stroke,
            fill: elementOptions.fill
        }).moveTo(shape[0]).lineTo(shape[1]).lineTo(shape[2]).close();

        var slot = scale.getSlot(options.value);
        elements.transform(geo.transform().translate(slot.x1, slot.y1));

        this.elements = elements;

        return elements;
    };

    return ArrowLinearPointer;
}(LinearPointer));

export default ArrowLinearPointer;