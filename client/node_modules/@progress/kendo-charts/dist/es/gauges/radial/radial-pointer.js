import { geometry as geo, drawing } from '@progress/kendo-drawing';

import { setDefaultOptions, deepExtend, limitValue } from '../../common';
import { ANGULAR_SPEED, DEGREE, DEFAULT_LINE_WIDTH, RADIAL_POINTER } from '../constants';
import Pointer from '../pointer';
import RadialPointerAnimation from './radial-pointer-animation';

var CAP_SIZE = 0.05;
var Circle = drawing.Circle;
var Group = drawing.Group;
var Path = drawing.Path;

var RadialPointer = (function (Pointer) {
    function RadialPointer () {
        Pointer.apply(this, arguments);
    }

    if ( Pointer ) RadialPointer.__proto__ = Pointer;
    RadialPointer.prototype = Object.create( Pointer && Pointer.prototype );
    RadialPointer.prototype.constructor = RadialPointer;

    RadialPointer.prototype.setAngle = function setAngle (angle) {
        this.elements.transform(geo.transform().rotate(angle, this.center));
    };

    RadialPointer.prototype.repaint = function repaint () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var oldAngle = scale.slotAngle(options._oldValue);
        var newAngle = scale.slotAngle(options.value);

        if (options.animation.transitions === false) {
            this.setAngle(newAngle);
        } else {
            new RadialPointerAnimation(this.elements, deepExtend(options.animation, {
                oldAngle: oldAngle,
                newAngle: newAngle
            })).play();
        }
    };

    RadialPointer.prototype.render = function render () {
        var ref = this;
        var scale = ref.scale;
        var options = ref.options;
        var elements = new Group();

        if (options.animation !== false) {
            deepExtend(options.animation, {
                startAngle: 0,
                center: scale.arc.center,
                reverse: scale.options.reverse
            });
        }

        elements.append(this._renderNeedle(), this._renderCap());

        this.elements = elements;
        this.setAngle(DEGREE);

        return elements;
    };

    RadialPointer.prototype.reflow = function reflow (arc) {
        var center = this.center = arc.center;
        var length = limitValue(this.options.length || 1, 0.1, 1.5);
        var radius = this.radius = arc.getRadiusX() * length;
        var capSize = this.capSize = Math.round(radius * this.options.cap.size);

        this.bbox = geo.Rect.fromPoints(new geo.Point(center.x - capSize, center.y - capSize),
                                    new geo.Point(center.x + capSize, center.y + capSize));
    };

    RadialPointer.prototype._renderNeedle = function _renderNeedle () {
        var minorTickSize = this.scale.options.minorTicks.size;
        var center = this.center;
        var needleColor = this.options.color;

        var needlePath = new Path({
            fill: { color: needleColor },
            stroke: { color: needleColor, width: DEFAULT_LINE_WIDTH }
        });

        needlePath.moveTo(center.x + this.radius - minorTickSize, center.y)
                  .lineTo(center.x, center.y - (this.capSize / 2))
                  .lineTo(center.x, center.y + (this.capSize / 2))
                  .close();

        return needlePath;
    };

    RadialPointer.prototype._renderCap = function _renderCap () {
        var options = this.options;
        var capColor = options.cap.color || options.color;
        var circle = new geo.Circle(this.center, this.capSize);

        var cap = new Circle(circle, {
            fill: { color: capColor },
            stroke: { color: capColor }
        });

        return cap;
    };

    return RadialPointer;
}(Pointer));

setDefaultOptions(RadialPointer, {
    cap: {
        size: CAP_SIZE
    },
    arrow: {
        width: 16,
        height: 14
    },
    animation: {
        type: RADIAL_POINTER,
        duration: ANGULAR_SPEED
    }
});

export default RadialPointer;
