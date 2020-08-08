import ChartElement from './chart-element';
import Box from './box';

import { X, Y, WIDTH, HEIGHT, RIGHT, BOTTOM, CENTER } from '../common/constants';
import { round, setDefaultOptions } from '../common';

var FloatElement = (function (ChartElement) {
    function FloatElement(options) {
        ChartElement.call(this, options);
        this._initDirection();
    }

    if ( ChartElement ) FloatElement.__proto__ = ChartElement;
    FloatElement.prototype = Object.create( ChartElement && ChartElement.prototype );
    FloatElement.prototype.constructor = FloatElement;

    FloatElement.prototype._initDirection = function _initDirection () {
        var options = this.options;
        if (options.vertical) {
            this.groupAxis = X;
            this.elementAxis = Y;
            this.groupSizeField = WIDTH;
            this.elementSizeField = HEIGHT;
            this.groupSpacing = options.spacing;
            this.elementSpacing = options.vSpacing;
        } else {
            this.groupAxis = Y;
            this.elementAxis = X;
            this.groupSizeField = HEIGHT;
            this.elementSizeField = WIDTH;
            this.groupSpacing = options.vSpacing;
            this.elementSpacing = options.spacing;
        }
    };

    FloatElement.prototype.reflow = function reflow (targetBox) {
        this.box = targetBox.clone();
        this.reflowChildren();
    };

    FloatElement.prototype.reflowChildren = function reflowChildren () {
        var this$1 = this;

        var ref = this;
        var box = ref.box;
        var elementAxis = ref.elementAxis;
        var groupAxis = ref.groupAxis;
        var elementSizeField = ref.elementSizeField;
        var groupSizeField = ref.groupSizeField;
        var ref$1 = this.groupOptions();
        var groups = ref$1.groups;
        var groupsSize = ref$1.groupsSize;
        var maxGroupElementsSize = ref$1.maxGroupElementsSize;
        var groupsCount = groups.length;
        var groupsStart = box[groupAxis + 1] + this.alignStart(groupsSize, box[groupSizeField]());

        if (groupsCount) {
            var groupStart = groupsStart;

            for (var groupIdx = 0; groupIdx < groupsCount; groupIdx++) {
                var group = groups[groupIdx];
                var groupElements = group.groupElements;
                var elementStart = box[elementAxis + 1];
                var groupElementsCount = groupElements.length;

                for (var idx = 0; idx < groupElementsCount; idx++) {
                    var element = groupElements[idx];
                    var elementSize = this$1.elementSize(element);
                    var groupElementStart = groupStart + this$1.alignStart(elementSize[groupSizeField], group.groupSize);

                    var elementBox = new Box();
                    elementBox[groupAxis + 1] = groupElementStart;
                    elementBox[groupAxis + 2] = groupElementStart + elementSize[groupSizeField];
                    elementBox[elementAxis + 1] = elementStart;
                    elementBox[elementAxis + 2] = elementStart + elementSize[elementSizeField];

                    element.reflow(elementBox);

                    elementStart += elementSize[elementSizeField] + this$1.elementSpacing;
                }
                groupStart += group.groupSize + this$1.groupSpacing;
            }
            box[groupAxis + 1] = groupsStart;
            box[groupAxis + 2] = groupsStart + groupsSize;
            box[elementAxis + 2] = box[elementAxis + 1] + maxGroupElementsSize;
        }
    };

    FloatElement.prototype.alignStart = function alignStart (size, maxSize) {
        var start = 0;
        var align = this.options.align;
        if (align === RIGHT || align === BOTTOM) {
            start = maxSize - size;
        } else if (align === CENTER) {
            start = (maxSize - size) / 2;
        }
        return start;
    };

    FloatElement.prototype.groupOptions = function groupOptions () {
        var this$1 = this;

        var ref = this;
        var box = ref.box;
        var children = ref.children;
        var elementSizeField = ref.elementSizeField;
        var groupSizeField = ref.groupSizeField;
        var elementSpacing = ref.elementSpacing;
        var groupSpacing = ref.groupSpacing;
        var maxSize = round(box[elementSizeField]());
        var childrenCount = children.length;
        var groups = [];

        var groupSize = 0;
        var groupElementsSize = 0;
        var groupsSize = 0;
        var maxGroupElementsSize = 0;
        var groupElements = [];

        for (var idx = 0; idx < childrenCount; idx++) {
            var element = children[idx];
            if (!element.box) {
                element.reflow(box);
            }

            var elementSize = this$1.elementSize(element);
            if (this$1.options.wrap && round(groupElementsSize + elementSpacing + elementSize[elementSizeField]) > maxSize) {
                groups.push({
                    groupElements: groupElements,
                    groupSize: groupSize,
                    groupElementsSize: groupElementsSize
                });
                maxGroupElementsSize = Math.max(maxGroupElementsSize, groupElementsSize);
                groupsSize += groupSpacing + groupSize;
                groupSize = 0;
                groupElementsSize = 0;
                groupElements = [];
            }
            groupSize = Math.max(groupSize, elementSize[groupSizeField]);
            if (groupElementsSize > 0) {
                groupElementsSize += elementSpacing;
            }
            groupElementsSize += elementSize[elementSizeField];
            groupElements.push(element);
        }

        groups.push({
            groupElements: groupElements,
            groupSize: groupSize,
            groupElementsSize: groupElementsSize
        });
        maxGroupElementsSize = Math.max(maxGroupElementsSize, groupElementsSize);
        groupsSize += groupSize;

        return {
            groups: groups,
            groupsSize: groupsSize,
            maxGroupElementsSize: maxGroupElementsSize
        };
    };

    FloatElement.prototype.elementSize = function elementSize (element) {
        return {
            width: element.box.width(),
            height: element.box.height()
        };
    };

    FloatElement.prototype.createVisual = function createVisual () {};

    return FloatElement;
}(ChartElement));

setDefaultOptions(FloatElement, {
    vertical: true,
    wrap: true,
    vSpacing: 0,
    spacing: 0
});

export default FloatElement;