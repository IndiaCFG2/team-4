import ChartElement from './chart-element';
import Box from './box';

import { X, Y, WIDTH, HEIGHT, RIGHT, BOTTOM, CENTER } from '../common/constants';
import { round, setDefaultOptions } from '../common';

class FloatElement extends ChartElement {
    constructor(options) {
        super(options);
        this._initDirection();
    }

    _initDirection() {
        const options = this.options;
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
    }

    reflow(targetBox) {
        this.box = targetBox.clone();
        this.reflowChildren();
    }

    reflowChildren() {
        const { box, elementAxis, groupAxis, elementSizeField, groupSizeField } = this;
        const { groups, groupsSize, maxGroupElementsSize } = this.groupOptions();
        const groupsCount = groups.length;
        const groupsStart = box[groupAxis + 1] + this.alignStart(groupsSize, box[groupSizeField]());

        if (groupsCount) {
            let groupStart = groupsStart;

            for (let groupIdx = 0; groupIdx < groupsCount; groupIdx++) {
                let group = groups[groupIdx];
                let groupElements = group.groupElements;
                let elementStart = box[elementAxis + 1];
                let groupElementsCount = groupElements.length;

                for (let idx = 0; idx < groupElementsCount; idx++) {
                    let element = groupElements[idx];
                    let elementSize = this.elementSize(element);
                    let groupElementStart = groupStart + this.alignStart(elementSize[groupSizeField], group.groupSize);

                    let elementBox = new Box();
                    elementBox[groupAxis + 1] = groupElementStart;
                    elementBox[groupAxis + 2] = groupElementStart + elementSize[groupSizeField];
                    elementBox[elementAxis + 1] = elementStart;
                    elementBox[elementAxis + 2] = elementStart + elementSize[elementSizeField];

                    element.reflow(elementBox);

                    elementStart += elementSize[elementSizeField] + this.elementSpacing;
                }
                groupStart += group.groupSize + this.groupSpacing;
            }
            box[groupAxis + 1] = groupsStart;
            box[groupAxis + 2] = groupsStart + groupsSize;
            box[elementAxis + 2] = box[elementAxis + 1] + maxGroupElementsSize;
        }
    }

    alignStart(size, maxSize) {
        let start = 0;
        const align = this.options.align;
        if (align === RIGHT || align === BOTTOM) {
            start = maxSize - size;
        } else if (align === CENTER) {
            start = (maxSize - size) / 2;
        }
        return start;
    }

    groupOptions() {
        const { box, children, elementSizeField, groupSizeField, elementSpacing, groupSpacing } = this;
        const maxSize = round(box[elementSizeField]());
        const childrenCount = children.length;
        const groups = [];

        let groupSize = 0;
        let groupElementsSize = 0;
        let groupsSize = 0;
        let maxGroupElementsSize = 0;
        let groupElements = [];

        for (let idx = 0; idx < childrenCount; idx++) {
            let element = children[idx];
            if (!element.box) {
                element.reflow(box);
            }

            let elementSize = this.elementSize(element);
            if (this.options.wrap && round(groupElementsSize + elementSpacing + elementSize[elementSizeField]) > maxSize) {
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
    }

    elementSize(element) {
        return {
            width: element.box.width(),
            height: element.box.height()
        };
    }

    createVisual() {}
}

setDefaultOptions(FloatElement, {
    vertical: true,
    wrap: true,
    vSpacing: 0,
    spacing: 0
});

export default FloatElement;