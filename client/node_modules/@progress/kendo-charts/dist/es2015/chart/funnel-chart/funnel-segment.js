import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box, Point } from '../../core';
import PointEventsMixin from '../mixins/point-events-mixin';

import { WHITE } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

class FunnelSegment extends ChartElement {
    constructor(value, options, segmentOptions) {
        super(options);

        this.value = value;
        this.options.index = segmentOptions.index;
    }

    reflow(chartBox) {
        const points = this.points;
        const label = this.children[0];

        this.box = new Box(points[0].x, points[0].y, points[1].x, points[2].y);

        if (label) {
            label.reflow(new Box(chartBox.x1, points[0].y, chartBox.x2, points[2].y));
        }
    }

    createVisual() {
        const options = this.options;
        let visual;

        super.createVisual();

        if (options.visual) {
            visual = options.visual({
                category: this.category,
                dataItem: this.dataItem,
                value: this.value,
                series: this.series,
                percentage: this.percentage,
                points: this.points,
                options: options,
                sender: this.getSender(),
                createVisual: () => this.createPath()
            });
        } else {
            visual = this.createPath();
        }

        if (visual) {
            this.visual.append(visual);
        }
    }

    createPath() {
        const options = this.options;
        const border = options.border;
        const path = draw.Path.fromPoints(this.points, {
            fill: {
                color: options.color,
                opacity: options.opacity
            },
            stroke: {
                color: border.color,
                opacity: border.opacity,
                width: border.width
            }
        }).close();

        return path;
    }

    createHighlight(style) {
        return draw.Path.fromPoints(this.points, style);
    }

    highlightVisual() {
        return this.visual.children[0];
    }

    highlightVisualArgs() {
        const path = draw.Path.fromPoints(this.points).close();

        return {
            options: this.options,
            path: path
        };
    }

    tooltipAnchor() {
        const box = this.box;
        return {
            point: new Point(box.center().x, box.y1),
            align: {
                horizontal: "center",
                vertical: "top"
            }
        };
    }

    formatValue(format) {
        const point = this;
        return point.owner.formatPointValue(point, format);
    }
}

setDefaultOptions(FunnelSegment, {
    color: WHITE,
    border: {
        width: 1
    }
});

deepExtend(FunnelSegment.prototype, PointEventsMixin);

export default FunnelSegment;