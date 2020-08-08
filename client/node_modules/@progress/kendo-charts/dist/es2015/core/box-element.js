import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import Box from './box';

import { BLACK, LEFT, TOP, X, Y } from '../common/constants';
import { getSpacing, setDefaultOptions, valueOrDefault } from '../common';

class BoxElement extends ChartElement {
    constructor(options) {
        super(options);

        this.options.margin = getSpacing(this.options.margin);
        this.options.padding = getSpacing(this.options.padding);
    }

    reflow(targetBox) {
        const options = this.options;
        const { width, height, shrinkToFit } = options;
        const hasSetSize = width && height;
        const margin = options.margin;
        const padding = options.padding;
        const borderWidth = options.border.width;
        let box;

        const reflowPaddingBox = () => {
            this.align(targetBox, X, options.align);
            this.align(targetBox, Y, options.vAlign);
            this.paddingBox = box.clone().unpad(margin).unpad(borderWidth);
        };

        let contentBox = targetBox.clone();
        if (hasSetSize) {
            contentBox.x2 = contentBox.x1 + width;
            contentBox.y2 = contentBox.y1 + height;
        }

        if (shrinkToFit) {
            contentBox.unpad(margin).unpad(borderWidth).unpad(padding);
        }

        super.reflow(contentBox);

        if (hasSetSize) {
            box = this.box = new Box(0, 0, width, height);
        } else {
            box = this.box;
        }

        if (shrinkToFit && hasSetSize) {
            reflowPaddingBox();
            contentBox = this.contentBox = this.paddingBox.clone().unpad(padding);
        } else {
            contentBox = this.contentBox = box.clone();
            box.pad(padding).pad(borderWidth).pad(margin);
            reflowPaddingBox();
        }

        this.translateChildren(
            box.x1 - contentBox.x1 + margin.left + borderWidth + padding.left,
            box.y1 - contentBox.y1 + margin.top + borderWidth + padding.top
        );

        const children = this.children;
        for (let i = 0; i < children.length; i++) {
            let item = children[i];
            item.reflow(item.box);
        }
    }

    align(targetBox, axis, alignment) {
        this.box.align(targetBox, axis, alignment);
    }

    hasBox() {
        const options = this.options;
        return options.border.width || options.background;
    }

    createVisual() {
        super.createVisual();

        const options = this.options;
        if (options.visible && this.hasBox()) {
            this.visual.append(draw.Path.fromRect(
                this.paddingBox.toRect(),
                this.visualStyle()
            ));
        }
    }

    visualStyle() {
        const options = this.options;
        const border = options.border || {};

        return {
            stroke: {
                width: border.width,
                color: border.color,
                opacity: valueOrDefault(border.opacity, options.opacity),
                dashType: border.dashType
            },
            fill: {
                color: options.background,
                opacity: options.opacity
            },
            cursor: options.cursor
        };
    }
}

setDefaultOptions(BoxElement, {
    align: LEFT,
    vAlign: TOP,
    margin: {},
    padding: {},
    border: {
        color: BLACK,
        width: 0
    },
    background: "",
    shrinkToFit: false,
    width: 0,
    height: 0,
    visible: true
});

export default BoxElement;