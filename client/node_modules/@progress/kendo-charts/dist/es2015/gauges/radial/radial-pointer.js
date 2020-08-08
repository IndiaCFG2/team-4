import { geometry as geo, drawing } from '@progress/kendo-drawing';

import { setDefaultOptions, deepExtend, limitValue } from '../../common';
import { ANGULAR_SPEED, DEGREE, DEFAULT_LINE_WIDTH, RADIAL_POINTER } from '../constants';
import Pointer from '../pointer';
import RadialPointerAnimation from './radial-pointer-animation';

const CAP_SIZE = 0.05;
const { Circle, Group, Path } = drawing;

class RadialPointer extends Pointer {

    setAngle(angle) {
        this.elements.transform(geo.transform().rotate(angle, this.center));
    }

    repaint() {
        const { scale, options } = this;
        const oldAngle = scale.slotAngle(options._oldValue);
        const newAngle = scale.slotAngle(options.value);

        if (options.animation.transitions === false) {
            this.setAngle(newAngle);
        } else {
            new RadialPointerAnimation(this.elements, deepExtend(options.animation, {
                oldAngle: oldAngle,
                newAngle: newAngle
            })).play();
        }
    }

    render() {
        const { scale, options } = this;
        const elements = new Group();

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
    }

    reflow(arc) {
        const center = this.center = arc.center;
        const length = limitValue(this.options.length || 1, 0.1, 1.5);
        const radius = this.radius = arc.getRadiusX() * length;
        const capSize = this.capSize = Math.round(radius * this.options.cap.size);

        this.bbox = geo.Rect.fromPoints(new geo.Point(center.x - capSize, center.y - capSize),
                                    new geo.Point(center.x + capSize, center.y + capSize));
    }

    _renderNeedle() {
        const minorTickSize = this.scale.options.minorTicks.size;
        const center = this.center;
        const needleColor = this.options.color;

        const needlePath = new Path({
            fill: { color: needleColor },
            stroke: { color: needleColor, width: DEFAULT_LINE_WIDTH }
        });

        needlePath.moveTo(center.x + this.radius - minorTickSize, center.y)
                  .lineTo(center.x, center.y - (this.capSize / 2))
                  .lineTo(center.x, center.y + (this.capSize / 2))
                  .close();

        return needlePath;
    }

    _renderCap() {
        const options = this.options;
        const capColor = options.cap.color || options.color;
        const circle = new geo.Circle(this.center, this.capSize);

        const cap = new Circle(circle, {
            fill: { color: capColor },
            stroke: { color: capColor }
        });

        return cap;
    }
}

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
