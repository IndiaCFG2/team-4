import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { ChartElement, CategoryAxis } from '../../core';
import CrosshairTooltip from './crosshair-tooltip';

import { BLACK, X, Y } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

var Crosshair = (function (ChartElement) {
    function Crosshair(chartService, axis, options) {
        ChartElement.call(this, options);

        this.axis = axis;
        this.stickyMode = axis instanceof CategoryAxis;

        var tooltipOptions = this.options.tooltip;

        if (tooltipOptions.visible) {
            this.tooltip = new CrosshairTooltip(chartService, this,
                deepExtend({}, tooltipOptions, { stickyMode: this.stickyMode })
            );
        }
    }

    if ( ChartElement ) Crosshair.__proto__ = ChartElement;
    Crosshair.prototype = Object.create( ChartElement && ChartElement.prototype );
    Crosshair.prototype.constructor = Crosshair;

    Crosshair.prototype.showAt = function showAt (point) {
        this.point = point;
        this.moveLine();
        this.line.visible(true);

        if (this.tooltip) {
            this.tooltip.showAt(point);
        }
    };

    Crosshair.prototype.hide = function hide () {
        this.line.visible(false);

        if (this.tooltip) {
            this.tooltip.hide();
        }
    };

    Crosshair.prototype.moveLine = function moveLine () {
        var ref = this;
        var axis = ref.axis;
        var point = ref.point;
        var vertical = axis.options.vertical;
        var box = this.getBox();
        var dim = vertical ? Y : X;
        var lineStart = new geom.Point(box.x1, box.y1);
        var lineEnd;

        if (vertical) {
            lineEnd = new geom.Point(box.x2, box.y1);
        } else {
            lineEnd = new geom.Point(box.x1, box.y2);
        }

        if (point) {
            if (this.stickyMode) {
                var slot = axis.getSlot(axis.pointCategoryIndex(point));
                lineStart[dim] = lineEnd[dim] = slot.center()[dim];
            } else {
                lineStart[dim] = lineEnd[dim] = point[dim];
            }
        }

        this.box = box;

        this.line.moveTo(lineStart).lineTo(lineEnd);
    };

    Crosshair.prototype.getBox = function getBox () {
        var axis = this.axis;
        var axes = axis.pane.axes;
        var length = axes.length;
        var vertical = axis.options.vertical;
        var box = axis.lineBox().clone();
        var dim = vertical ? X : Y;
        var axisLineBox;

        for (var i = 0; i < length; i++) {
            var currentAxis = axes[i];
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
    };

    Crosshair.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);

        var options = this.options;
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
    };

    Crosshair.prototype.destroy = function destroy () {
        if (this.tooltip) {
            this.tooltip.destroy();
        }

        ChartElement.prototype.destroy.call(this);
    };

    return Crosshair;
}(ChartElement));

setDefaultOptions(Crosshair, {
    color: BLACK,
    width: 2,
    zIndex: -1,
    tooltip: {
        visible: false
    }
});

export default Crosshair;