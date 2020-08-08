import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Point, Box } from '../../core';

import { FADEIN, INITIAL_ANIMATION_DURATION } from '../constants';

import { setDefaultOptions, alignPathToPixel } from '../../common';

var DEFAULT_ERROR_BAR_WIDTH = 4;

var ErrorBarBase = (function (ChartElement) {
    function ErrorBarBase(low, high, isVertical, chart, series, options) {
        ChartElement.call(this, options);

        this.low = low;
        this.high = high;
        this.isVertical = isVertical;
        this.chart = chart;
        this.series = series;
    }

    if ( ChartElement ) ErrorBarBase.__proto__ = ChartElement;
    ErrorBarBase.prototype = Object.create( ChartElement && ChartElement.prototype );
    ErrorBarBase.prototype.constructor = ErrorBarBase;

    ErrorBarBase.prototype.reflow = function reflow (targetBox) {
        var endCaps = this.options.endCaps;
        var isVertical = this.isVertical;
        var axis = this.getAxis();
        var valueBox = axis.getSlot(this.low, this.high);
        var centerBox = targetBox.center();
        var capsWidth = this.getCapsWidth(targetBox, isVertical);
        var capValue = isVertical ? centerBox.x : centerBox.y;
        var capStart = capValue - capsWidth;
        var capEnd = capValue + capsWidth;
        var linePoints;

        if (isVertical) {
            linePoints = [
                new Point(centerBox.x, valueBox.y1),
                new Point(centerBox.x, valueBox.y2)
            ];
            if (endCaps) {
                linePoints.push(new Point(capStart, valueBox.y1),
                    new Point(capEnd, valueBox.y1),
                    new Point(capStart, valueBox.y2),
                    new Point(capEnd, valueBox.y2));
            }
            this.box = new Box(capStart, valueBox.y1, capEnd, valueBox.y2);
        } else {
            linePoints = [
                new Point(valueBox.x1, centerBox.y),
                new Point(valueBox.x2, centerBox.y)
            ];
            if (endCaps) {
                linePoints.push(new Point(valueBox.x1, capStart),
                    new Point(valueBox.x1, capEnd),
                    new Point(valueBox.x2, capStart),
                    new Point(valueBox.x2, capEnd));
            }
            this.box = new Box(valueBox.x1, capStart, valueBox.x2, capEnd);
        }

        this.linePoints = linePoints;
    };

    ErrorBarBase.prototype.getCapsWidth = function getCapsWidth (box, isVertical) {
        var boxSize = isVertical ? box.width() : box.height();
        var capsWidth = Math.min(Math.floor(boxSize / 2), DEFAULT_ERROR_BAR_WIDTH) || DEFAULT_ERROR_BAR_WIDTH;

        return capsWidth;
    };

    ErrorBarBase.prototype.createVisual = function createVisual () {
        var this$1 = this;

        var options = this.options;
        var visual = options.visual;

        if (visual) {
            this.visual = visual({
                low: this.low,
                high: this.high,
                rect: this.box.toRect(),
                sender: this.getSender(),
                options: {
                    endCaps: options.endCaps,
                    color: options.color,
                    line: options.line
                },
                createVisual: function () {
                    this$1.createDefaultVisual();
                    var defaultVisual = this$1.visual;
                    delete this$1.visual;
                    return defaultVisual;
                }
            });
        } else {
            this.createDefaultVisual();
        }
    };

    ErrorBarBase.prototype.createDefaultVisual = function createDefaultVisual () {
        var this$1 = this;

        var ref = this;
        var options = ref.options;
        var linePoints = ref.linePoints;
        var lineOptions = {
            stroke: {
                color: options.color,
                width: options.line.width,
                dashType: options.line.dashType
            }
        };

        ChartElement.prototype.createVisual.call(this);

        for (var idx = 0; idx < linePoints.length; idx += 2) {
            var line = new draw.Path(lineOptions)
                .moveTo(linePoints[idx].x, linePoints[idx].y)
                .lineTo(linePoints[idx + 1].x, linePoints[idx + 1].y);

            alignPathToPixel(line);
            this$1.visual.append(line);
        }
    };

    return ErrorBarBase;
}(ChartElement));

setDefaultOptions(ErrorBarBase, {
    animation: {
        type: FADEIN,
        delay: INITIAL_ANIMATION_DURATION
    },
    endCaps: true,
    line: {
        width: 2
    },
    zIndex: 1
});

export default ErrorBarBase;