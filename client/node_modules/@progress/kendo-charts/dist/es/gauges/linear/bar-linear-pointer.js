import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { deepExtend, defined } from '../../common';
import { X, Y } from '../../common/constants';
import LinearPointer from './linear-pointer';
import BarLinearPointerAnimation from './bar-linear-pointer-animation';

var Group = drawing.Group;
var Path = drawing.Path;

var BarLinearPointer = (function (LinearPointer) {
    function BarLinearPointer(scale, options) {
        LinearPointer.call(this, scale, options);

        if (!defined(this.options.size)) {
            this.options.size = this.scale.options.majorTicks.size * 0.3;
        }
    }

    if ( LinearPointer ) BarLinearPointer.__proto__ = LinearPointer;
    BarLinearPointer.prototype = Object.create( LinearPointer && LinearPointer.prototype );
    BarLinearPointer.prototype.constructor = BarLinearPointer;

    BarLinearPointer.prototype.pointerShape = function pointerShape (value) {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var ref$1 = scale.options;
        var mirror = ref$1.mirror;
        var vertical = ref$1.vertical;
        var dir = mirror === vertical ? -1 : 1;
        var size = options.size * dir;
        var minSlot = scale.getSlot(scale.options.min);
        var slot = scale.getSlot(value);
        var axis = vertical ? Y : X;
        var sizeAxis = vertical ? X : Y;
        var margin = this._margin() * dir;

        var p1 = new geo.Point();
        p1[axis] = minSlot[axis + "1"];
        p1[sizeAxis] = minSlot[sizeAxis + "1"];

        var p2 = new geo.Point();
        p2[axis] = slot[axis + "1"];
        p2[sizeAxis] = slot[sizeAxis + "1"];

        if (vertical) {
            p1.translate(margin, 0);
            p2.translate(margin, 0);
        } else {
            p1.translate(0, margin);
            p2.translate(0, margin);
        }

        var p3 = p2.clone();
        var p4 = p1.clone();

        if (vertical) {
            p3.translate(size, 0);
            p4.translate(size, 0);
        } else {
            p3.translate(0, size);
            p4.translate(0, size);
        }

        return [ p1, p2, p3, p4 ];
    };

    BarLinearPointer.prototype.repaint = function repaint () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var shape = this.pointerShape(options.value);
        var pointerPath = this.pointerPath;
        var oldShape = this.pointerShape(options._oldValue);

        pointerPath.moveTo(shape[0]).lineTo(shape[1]).lineTo(shape[2]).lineTo(shape[3]).close();

        var animation = new BarLinearPointerAnimation(pointerPath, deepExtend(options.animation, {
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
    };

    BarLinearPointer.prototype.render = function render () {
        var group = new Group();
        var elementOptions = this.getElementOptions();

        if (this.options.track.visible) {
            group.append(this.renderTrack());
        }

        var pointer = this.pointerPath = new Path({
            stroke: elementOptions.stroke,
            fill: elementOptions.fill
        });

        group.append(pointer);

        this.elements = group;

        return group;
    };

    BarLinearPointer.prototype.renderTrack = function renderTrack () {
        var trackOptions = this.options.track;
        var border = trackOptions.border || {};
        var trackBox = this.trackBox.clone().pad(border.width || 0);

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
    };

    return BarLinearPointer;
}(LinearPointer));

export default BarLinearPointer;