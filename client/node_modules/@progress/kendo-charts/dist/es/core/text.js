import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import Box from './box';

import { DEFAULT_FONT, BLACK } from '../common/constants';
import { setDefaultOptions } from '../common';

var DrawingText = draw.Text;

var Text = (function (ChartElement) {
    function Text(content, options) {
        ChartElement.call(this, options);

        this.content = content;

        // Calculate size
        this.reflow(new Box());
    }

    if ( ChartElement ) Text.__proto__ = ChartElement;
    Text.prototype = Object.create( ChartElement && ChartElement.prototype );
    Text.prototype.constructor = Text;

    Text.prototype.reflow = function reflow (targetBox) {
        var options = this.options;
        var size = options.size = draw.util.measureText(this.content, { font: options.font });

        this.baseline = size.baseline;

        this.box = new Box(targetBox.x1, targetBox.y1,
                targetBox.x1 + size.width, targetBox.y1 + size.height);
    };

    Text.prototype.createVisual = function createVisual () {
        var ref = this.options;
        var font = ref.font;
        var color = ref.color;
        var opacity = ref.opacity;
        var cursor = ref.cursor;

        this.visual = new DrawingText(this.content, this.box.toRect().topLeft(), {
            font: font,
            fill: { color: color, opacity: opacity },
            cursor: cursor
        });
    };

    return Text;
}(ChartElement));

setDefaultOptions(Text, {
    font: DEFAULT_FONT,
    color: BLACK
});

export default Text;
