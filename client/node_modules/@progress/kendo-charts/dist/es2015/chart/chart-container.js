import { drawing as draw } from '@progress/kendo-drawing';
import { alignPathToPixel } from '../common';

import { ChartElement } from '../core';

class ChartContainer extends ChartElement {
    constructor(options, pane) {
        super(options);
        this.pane = pane;
    }

    shouldClip() {
        const children = this.children;
        const length = children.length;

        for (let i = 0; i < length; i++) {
            if (children[i].options.clip === true) {
                return true;
            }
        }
        return false;
    }

    _clipBox() {
        return this.pane.chartsBox();
    }

    createVisual() {
        this.visual = new draw.Group({
            zIndex: 0
        });

        if (this.shouldClip()) {
            const clipBox = this.clipBox = this._clipBox();
            const clipRect = clipBox.toRect();
            const clipPath = draw.Path.fromRect(clipRect);
            alignPathToPixel(clipPath);

            this.visual.clip(clipPath);
            this.unclipLabels();
        }
    }

    stackRoot() {
        return this;
    }

    unclipLabels() {
        const { children: charts, clipBox } = this;

        for (let i = 0; i < charts.length; i++) {
            const points = charts[i].points || {};
            const length = points.length;

            for (let j = 0; j < length; j++) {
                const point = points[j];
                if (point && point.visible !== false && point.overlapsBox && point.overlapsBox(clipBox)) {
                    if (point.unclipElements) {
                        point.unclipElements();
                    } else {
                        const { label, note } = point;

                        if (label && label.options.visible) {
                            if (label.alignToClipBox) {
                                label.alignToClipBox(clipBox);
                            }
                            label.options.noclip = true;
                        }

                        if (note && note.options.visible) {
                            note.options.noclip = true;
                        }
                    }
                }
            }
        }
    }

    destroy() {
        super.destroy();

        delete this.parent;
    }
}

ChartContainer.prototype.isStackRoot = true;

export default ChartContainer;