import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import Box from './box';

import { BLACK, LEFT, TOP, X, Y } from '../common/constants';
import { getSpacing, setDefaultOptions, valueOrDefault } from '../common';

var BoxElement = (function (ChartElement) {
    function BoxElement(options) {
        ChartElement.call(this, options);

        this.options.margin = getSpacing(this.options.margin);
        this.options.padding = getSpacing(this.options.padding);
    }

    if ( ChartElement ) BoxElement.__proto__ = ChartElement;
    BoxElement.prototype = Object.create( ChartElement && ChartElement.prototype );
    BoxElement.prototype.constructor = BoxElement;

    BoxElement.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        var options = this.options;
        var width = options.width;
        var height = options.height;
        var shrinkToFit = options.shrinkToFit;
        var hasSetSize = width && height;
        var margin = options.margin;
        var padding = options.padding;
        var borderWidth = options.border.width;
        var box;

        var reflowPaddingBox = function () {
            this$1.align(targetBox, X, options.align);
            this$1.align(targetBox, Y, options.vAlign);
            this$1.paddingBox = box.clone().unpad(margin).unpad(borderWidth);
        };

        var contentBox = targetBox.clone();
        if (hasSetSize) {
            contentBox.x2 = contentBox.x1 + width;
            contentBox.y2 = contentBox.y1 + height;
        }

        if (shrinkToFit) {
            contentBox.unpad(margin).unpad(borderWidth).unpad(padding);
        }

        ChartElement.prototype.reflow.call(this, contentBox);

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

        var children = this.children;
        for (var i = 0; i < children.length; i++) {
            var item = children[i];
            item.reflow(item.box);
        }
    };

    BoxElement.prototype.align = function align (targetBox, axis, alignment) {
        this.box.align(targetBox, axis, alignment);
    };

    BoxElement.prototype.hasBox = function hasBox () {
        var options = this.options;
        return options.border.width || options.background;
    };

    BoxElement.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);

        var options = this.options;
        if (options.visible && this.hasBox()) {
            this.visual.append(draw.Path.fromRect(
                this.paddingBox.toRect(),
                this.visualStyle()
            ));
        }
    };

    BoxElement.prototype.visualStyle = function visualStyle () {
        var options = this.options;
        var border = options.border || {};

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
    };

    return BoxElement;
}(ChartElement));

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