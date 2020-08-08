import { geometry as geom } from '@progress/kendo-drawing';

import TextBox from './text-box';
import Box from './box';

import rectToBox from './utils/rect-to-box';

import { AXIS_LABEL_CLICK, CENTER, TOP, BOTTOM, LEFT, DEFAULT_PRECISION, X, Y } from '../common/constants';

import { eventElement, round, setDefaultOptions } from '../common';

var AxisLabel = (function (TextBox) {
    function AxisLabel(value, text, index, dataItem, options) {
        TextBox.call(this, text, options);

        this.text = text;
        this.value = value;
        this.index = index;
        this.dataItem = dataItem;
        this.reflow(new Box());
    }

    if ( TextBox ) AxisLabel.__proto__ = TextBox;
    AxisLabel.prototype = Object.create( TextBox && TextBox.prototype );
    AxisLabel.prototype.constructor = AxisLabel;

    AxisLabel.prototype.visualContext = function visualContext (targetBox) {
        var context = TextBox.prototype.visualContext.call(this, targetBox);

        context.value = this.value;
        context.dataItem = this.dataItem;
        context.format = this.options.format;
        context.culture = this.options.culture;

        return context;
    };

    AxisLabel.prototype.click = function click (widget, e) {

        widget.trigger(AXIS_LABEL_CLICK, {
            element: eventElement(e),
            value: this.value,
            text: this.text,
            index: this.index,
            dataItem: this.dataItem,
            axis: this.parent.options
        });
    };

    AxisLabel.prototype.rotate = function rotate () {
        if (this.options.alignRotation !== CENTER) {
            var box = this.normalBox.toRect();
            var transform = this.rotationTransform();

            this.box = rectToBox(box.bbox(transform.matrix()));
        } else {
            TextBox.prototype.rotate.call(this);
        }

        return this.box;
    };

    AxisLabel.prototype.rotationTransform = function rotationTransform () {
        var options = this.options;
        var rotation = options.rotation;
        if (!rotation) {
            return null;
        }

        if (options.alignRotation === CENTER) {
            return TextBox.prototype.rotationTransform.call(this);
        }

        var rotationMatrix = geom.transform().rotate(rotation).matrix();
        var box = this.normalBox.toRect();
        var rect = this.targetBox.toRect();

        var rotationOrigin = options.rotationOrigin || TOP;
        var alignAxis = rotationOrigin === TOP || rotationOrigin === BOTTOM ? X : Y;
        var distanceAxis = rotationOrigin === TOP || rotationOrigin === BOTTOM ? Y : X;
        var axisAnchor = rotationOrigin === TOP || rotationOrigin === LEFT ? rect.origin : rect.bottomRight();

        var topLeft = box.topLeft().transformCopy(rotationMatrix);
        var topRight = box.topRight().transformCopy(rotationMatrix);
        var bottomRight = box.bottomRight().transformCopy(rotationMatrix);
        var bottomLeft = box.bottomLeft().transformCopy(rotationMatrix);
        var rotatedBox = geom.Rect.fromPoints(topLeft, topRight, bottomRight, bottomLeft);

        var translate = {};
        translate[distanceAxis] = rect.origin[distanceAxis] - rotatedBox.origin[distanceAxis];

        var distanceLeft = Math.abs(topLeft[distanceAxis] + translate[distanceAxis] - axisAnchor[distanceAxis]);
        var distanceRight = Math.abs(topRight[distanceAxis] + translate[distanceAxis] - axisAnchor[distanceAxis]);

        var alignStart, alignEnd;

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

        var alignCenter = alignStart[alignAxis] + (alignEnd[alignAxis] - alignStart[alignAxis]) / 2;
        translate[alignAxis] = rect.center()[alignAxis] - alignCenter;

        return geom.transform()
            .translate(translate.x, translate.y)
            .rotate(rotation);
    };

    return AxisLabel;
}(TextBox));

setDefaultOptions(AxisLabel, {
    _autoReflow: false
});

export default AxisLabel;
