import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box, rectToBox } from '../../core';

class LegendLayout extends ChartElement {

    constructor(options, chartService) {
        super(options);

        this.chartService = chartService;
    }

    render() {
        const { children, options } = this;
        const vertical = options.vertical;

        this.visual = new draw.Layout(null, {
            spacing: vertical ? 0 : options.spacing,
            lineSpacing: vertical ? options.spacing : 0,
            orientation: vertical ? "vertical" : "horizontal",
            reverse: options.rtl,
            alignItems: vertical ? "start" : "center"
        });

        for (let idx = 0; idx < children.length; idx++) {
            let legendItem = children[idx];
            legendItem.reflow(new Box());
            legendItem.renderVisual();
        }
    }

    reflow(box) {
        this.visual.rect(box.toRect());
        this.visual.reflow();
        const bbox = this.visual.clippedBBox();

        if (bbox) {
            this.box = rectToBox(bbox);
        } else {
            this.box = new Box();
        }
    }

    renderVisual() {
        this.addVisual();
    }

    createVisual() {}
}

export default LegendLayout;