import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { deepExtend, defined } from '../../common';
import { X, Y } from '../../common/constants';
import LinearPointer from './linear-pointer';
import BarLinearPointerAnimation from './bar-linear-pointer-animation';

const { Group, Path } = drawing;

class BarLinearPointer extends LinearPointer {
    constructor(scale, options) {
        super(scale, options);

        if (!defined(this.options.size)) {
            this.options.size = this.scale.options.majorTicks.size * 0.3;
        }
    }

    pointerShape(value) {
        const { scale, options } = this;
        const { mirror, vertical } = scale.options;
        const dir = mirror === vertical ? -1 : 1;
        const size = options.size * dir;
        const minSlot = scale.getSlot(scale.options.min);
        const slot = scale.getSlot(value);
        const axis = vertical ? Y : X;
        const sizeAxis = vertical ? X : Y;
        const margin = this._margin() * dir;

        const p1 = new geo.Point();
        p1[axis] = minSlot[axis + "1"];
        p1[sizeAxis] = minSlot[sizeAxis + "1"];

        const p2 = new geo.Point();
        p2[axis] = slot[axis + "1"];
        p2[sizeAxis] = slot[sizeAxis + "1"];

        if (vertical) {
            p1.translate(margin, 0);
            p2.translate(margin, 0);
        } else {
            p1.translate(0, margin);
            p2.translate(0, margin);
        }

        const p3 = p2.clone();
        const p4 = p1.clone();

        if (vertical) {
            p3.translate(size, 0);
            p4.translate(size, 0);
        } else {
            p3.translate(0, size);
            p4.translate(0, size);
        }

        return [ p1, p2, p3, p4 ];
    }

    repaint() {
        const { scale, options } = this;
        const shape = this.pointerShape(options.value);
        const pointerPath = this.pointerPath;
        const oldShape = this.pointerShape(options._oldValue);

        pointerPath.moveTo(shape[0]).lineTo(shape[1]).lineTo(shape[2]).lineTo(shape[3]).close();

        const animation = new BarLinearPointerAnimation(pointerPath, deepExtend(options.animation, {
            reverse: scale.options.reverse,
            vertical: scale.options.vertical,
            oldPoints: [ oldShape[1], oldShape[2] ],
            newPoints: [ shape[1], shape[2] ]
        }));

        if (options.animation.transitions === false) {
            animation.options.duration = 0;
        }

        animation.setup();
        animation.play();
    }

    render() {
        const group = new Group();
        const elementOptions = this.getElementOptions();

        if (this.options.track.visible) {
            group.append(this.renderTrack());
        }

        const pointer = this.pointerPath = new Path({
            stroke: elementOptions.stroke,
            fill: elementOptions.fill
        });

        group.append(pointer);

        this.elements = group;

        return group;
    }

    renderTrack() {
        const trackOptions = this.options.track;
        const border = trackOptions.border || {};
        const trackBox = this.trackBox.clone().pad(border.width || 0);

        return new Path.fromRect(trackBox.toRect(), {
            fill: {
                color: trackOptions.color,
                opacity: trackOptions.opacity
            },
            stroke: {
                color: border.width ? border.color || trackOptions.color : "",
                width: border.width,
                dashType: border.dashType
            }
        });
    }
}

export default BarLinearPointer;