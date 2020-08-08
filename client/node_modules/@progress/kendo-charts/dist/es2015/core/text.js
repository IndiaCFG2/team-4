import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import Box from './box';

import { DEFAULT_FONT, BLACK } from '../common/constants';
import { setDefaultOptions } from '../common';

const DrawingText = draw.Text;

class Text extends ChartElement {

    constructor(content, options) {
        super(options);

        this.content = content;

        // Calculate size
        this.reflow(new Box());
    }

    reflow(targetBox) {
        const options = this.options;
        const size = options.size = draw.util.measureText(this.content, { font: options.font });

        this.baseline = size.baseline;

        this.box = new Box(targetBox.x1, targetBox.y1,
                targetBox.x1 + size.width, targetBox.y1 + size.height);
    }

    createVisual() {
        const { font, color, opacity, cursor } = this.options;

        this.visual = new DrawingText(this.content, this.box.toRect().topLeft(), {
            font: font,
            fill: { color: color, opacity: opacity },
            cursor: cursor
        });
    }
}

setDefaultOptions(Text, {
    font: DEFAULT_FONT,
    color: BLACK
});

export default Text;
