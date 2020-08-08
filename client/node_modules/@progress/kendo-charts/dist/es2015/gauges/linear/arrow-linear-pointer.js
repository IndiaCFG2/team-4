import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { deepExtend, defined } from '../../common';
import { ARROW_POINTER } from '../constants';
import LinearPointer from './linear-pointer';
import ArrowLinearPointerAnimation from './arrow-linear-pointer-animation';

const Point = geo.Point;
const Path = drawing.Path;

class ArrowLinearPointer extends LinearPointer {
    constructor(scale, options) {
        super(scale, options);

        if (!defined(this.options.size)) {
            this.options.size = this.scale.options.majorTicks.size * 0.6;
        }
    }

    pointerShape() {
        const { scale, options: { size } } = this;
        const halfSize = size / 2;
        const sign = (scale.options.mirror ? -1 : 1);
        let shape;

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
    }

    repaint() {
        const { scale, options } = this;
        const animation = new ArrowLinearPointerAnimation(this.elements, deepExtend(options.animation, {
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
    }

    render() {
        const { scale, options } = this;
        const elementOptions = this.getElementOptions();
        const shape = this.pointerShape(options.value);

        options.animation.type = ARROW_POINTER;

        const elements = new Path({
            stroke: elementOptions.stroke,
            fill: elementOptions.fill
        }).moveTo(shape[0]).lineTo(shape[1]).lineTo(shape[2]).close();

        const slot = scale.getSlot(options.value);
        elements.transform(geo.transform().translate(slot.x1, slot.y1));

        this.elements = elements;

        return elements;
    }
}

export default ArrowLinearPointer;