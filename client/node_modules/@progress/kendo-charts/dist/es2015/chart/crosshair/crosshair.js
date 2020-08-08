import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { ChartElement, CategoryAxis } from '../../core';
import CrosshairTooltip from './crosshair-tooltip';

import { BLACK, X, Y } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

class Crosshair extends ChartElement {
    constructor(chartService, axis, options) {
        super(options);

        this.axis = axis;
        this.stickyMode = axis instanceof CategoryAxis;

        const tooltipOptions = this.options.tooltip;

        if (tooltipOptions.visible) {
            this.tooltip = new CrosshairTooltip(chartService, this,
                deepExtend({}, tooltipOptions, { stickyMode: this.stickyMode })
            );
        }
    }

    showAt(point) {
        this.point = point;
        this.moveLine();
        this.line.visible(true);

        if (this.tooltip) {
            this.tooltip.showAt(point);
        }
    }

    hide() {
        this.line.visible(false);

        if (this.tooltip) {
            this.tooltip.hide();
        }
    }

    moveLine() {
        const { axis, point } = this;
        const vertical = axis.options.vertical;
        const box = this.getBox();
        const dim = vertical ? Y : X;
        const lineStart = new geom.Point(box.x1, box.y1);
        let lineEnd;

        if (vertical) {
            lineEnd = new geom.Point(box.x2, box.y1);
        } else {
            lineEnd = new geom.Point(box.x1, box.y2);
        }

        if (point) {
            if (this.stickyMode) {
                const slot = axis.getSlot(axis.pointCategoryIndex(point));
                lineStart[dim] = lineEnd[dim] = slot.center()[dim];
            } else {
                lineStart[dim] = lineEnd[dim] = point[dim];
            }
        }

        this.box = box;

        this.line.moveTo(lineStart).lineTo(lineEnd);
    }

    getBox() {
        const axis = this.axis;
        const axes = axis.pane.axes;
        const length = axes.length;
        const vertical = axis.options.vertical;
        const box = axis.lineBox().clone();
        const dim = vertical ? X : Y;
        let axisLineBox;

        for (let i = 0; i < length; i++) {
            const currentAxis = axes[i];
            if (currentAxis.options.vertical !== vertical) {
                if (!axisLineBox) {
                    axisLineBox = currentAxis.lineBox().clone();
                } else {
                    axisLineBox.wrap(currentAxis.lineBox());
                }
            }
        }

        box[dim + 1] = axisLineBox[dim + 1];
        box[dim + 2] = axisLineBox[dim + 2];

        return box;
    }

    createVisual() {
        super.createVisual();

        const options = this.options;
        this.line = new draw.Path({
            stroke: {
                color: options.color,
                width: options.width,
                opacity: options.opacity,
                dashType: options.dashType
            },
            visible: false
        });

        this.moveLine();
        this.visual.append(this.line);
    }

    destroy() {
        if (this.tooltip) {
            this.tooltip.destroy();
        }

        super.destroy();
    }
}

setDefaultOptions(Crosshair, {
    color: BLACK,
    width: 2,
    zIndex: -1,
    tooltip: {
        visible: false
    }
});

export default Crosshair;