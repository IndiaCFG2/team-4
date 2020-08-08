import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box, Point } from '../../core';
import PointEventsMixin from '../mixins/point-events-mixin';

import { WHITE } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

var FunnelSegment = (function (ChartElement) {
    function FunnelSegment(value, options, segmentOptions) {
        ChartElement.call(this, options);

        this.value = value;
        this.options.index = segmentOptions.index;
    }

    if ( ChartElement ) FunnelSegment.__proto__ = ChartElement;
    FunnelSegment.prototype = Object.create( ChartElement && ChartElement.prototype );
    FunnelSegment.prototype.constructor = FunnelSegment;

    FunnelSegment.prototype.reflow = function reflow (chartBox) {
        var points = this.points;
        var label = this.children[0];

        this.box = new Box(points[0].x, points[0].y, points[1].x, points[2].y);

        if (label) {
            label.reflow(new Box(chartBox.x1, points[0].y, chartBox.x2, points[2].y));
        }
    };

    FunnelSegment.prototype.createVisual = function createVisual () {
        var this$1 = this;

        var options = this.options;
        var visual;

        ChartElement.prototype.createVisual.call(this);

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
                createVisual: function () { return this$1.createPath(); }
            });
        } else {
            visual = this.createPath();
        }

        if (visual) {
            this.visual.append(visual);
        }
    };

    FunnelSegment.prototype.createPath = function createPath () {
        var options = this.options;
        var border = options.border;
        var path = draw.Path.fromPoints(this.points, {
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
    };

    FunnelSegment.prototype.createHighlight = function createHighlight (style) {
        return draw.Path.fromPoints(this.points, style);
    };

    FunnelSegment.prototype.highlightVisual = function highlightVisual () {
        return this.visual.children[0];
    };

    FunnelSegment.prototype.highlightVisualArgs = function highlightVisualArgs () {
        var path = draw.Path.fromPoints(this.points).close();

        return {
            options: this.options,
            path: path
        };
    };

    FunnelSegment.prototype.tooltipAnchor = function tooltipAnchor () {
        var box = this.box;
        return {
            point: new Point(box.center().x, box.y1),
            align: {
                horizontal: "center",
                vertical: "top"
            }
        };
    };

    FunnelSegment.prototype.formatValue = function formatValue (format) {
        var point = this;
        return point.owner.formatPointValue(point, format);
    };

    return FunnelSegment;
}(ChartElement));

setDefaultOptions(FunnelSegment, {
    color: WHITE,
    border: {
        width: 1
    }
});

deepExtend(FunnelSegment.prototype, PointEventsMixin);

export default FunnelSegment;