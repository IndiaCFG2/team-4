import { geometry as geom } from '@progress/kendo-drawing';

import TextBox from './text-box';
import Box from './box';

import rectToBox from './utils/rect-to-box';

import { AXIS_LABEL_CLICK, CENTER, TOP, BOTTOM, LEFT, DEFAULT_PRECISION, X, Y } from '../common/constants';

import { eventElement, round, setDefaultOptions } from '../common';

class AxisLabel extends TextBox {
    constructor(value, text, index, dataItem, options) {
        super(text, options);

        this.text = text;
        this.value = value;
        this.index = index;
        this.dataItem = dataItem;
        this.reflow(new Box());
    }

    visualContext(targetBox) {
        const context = super.visualContext(targetBox);

        context.value = this.value;
        context.dataItem = this.dataItem;
        context.format = this.options.format;
        context.culture = this.options.culture;

        return context;
    }

    click(widget, e) {

        widget.trigger(AXIS_LABEL_CLICK, {
            element: eventElement(e),
            value: this.value,
            text: this.text,
            index: this.index,
            dataItem: this.dataItem,
            axis: this.parent.options
        });
    }

    rotate() {
        if (this.options.alignRotation !== CENTER) {
            const box = this.normalBox.toRect();
            const transform = this.rotationTransform();

            this.box = rectToBox(box.bbox(transform.matrix()));
        } else {
            super.rotate();
        }

        return this.box;
    }

    rotationTransform() {
        const options = this.options;
        const rotation = options.rotation;
        if (!rotation) {
            return null;
        }

        if (options.alignRotation === CENTER) {
            return super.rotationTransform();
        }

        const rotationMatrix = geom.transform().rotate(rotation).matrix();
        const box = this.normalBox.toRect();
        const rect = this.targetBox.toRect();

        const rotationOrigin = options.rotationOrigin || TOP;
        const alignAxis = rotationOrigin === TOP || rotationOrigin === BOTTOM ? X : Y;
        const distanceAxis = rotationOrigin === TOP || rotationOrigin === BOTTOM ? Y : X;
        const axisAnchor = rotationOrigin === TOP || rotationOrigin === LEFT ? rect.origin : rect.bottomRight();

        const topLeft = box.topLeft().transformCopy(rotationMatrix);
        const topRight = box.topRight().transformCopy(rotationMatrix);
        const bottomRight = box.bottomRight().transformCopy(rotationMatrix);
        const bottomLeft = box.bottomLeft().transformCopy(rotationMatrix);
        const rotatedBox = geom.Rect.fromPoints(topLeft, topRight, bottomRight, bottomLeft);

        const translate = {
            [distanceAxis]: rect.origin[distanceAxis] - rotatedBox.origin[distanceAxis]
        };

        const distanceLeft = Math.abs(topLeft[distanceAxis] + translate[distanceAxis] - axisAnchor[distanceAxis]);
        const distanceRight = Math.abs(topRight[distanceAxis] + translate[distanceAxis] - axisAnchor[distanceAxis]);

        let alignStart, alignEnd;

        if (round(distanceLeft, DEFAULT_PRECISION) === round(distanceRight, DEFAULT_PRECISION)) {
            alignStart = topLeft;
            alignEnd = topRight;
        } else if (distanceRight < distanceLeft) {
            alignStart = topRight;
            alignEnd = bottomRight;
        } else {
            alignStart = topLeft;
            alignEnd = bottomLeft;
        }

        const alignCenter = alignStart[alignAxis] + (alignEnd[alignAxis] - alignStart[alignAxis]) / 2;
        translate[alignAxis] = rect.center()[alignAxis] - alignCenter;

        return geom.transform()
            .translate(translate.x, translate.y)
            .rotate(rotation);
    }
}

setDefaultOptions(AxisLabel, {
    _autoReflow: false
});

export default AxisLabel;
