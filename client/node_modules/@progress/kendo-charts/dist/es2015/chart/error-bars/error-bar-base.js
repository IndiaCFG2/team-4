import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Point, Box } from '../../core';

import { FADEIN, INITIAL_ANIMATION_DURATION } from '../constants';

import { setDefaultOptions, alignPathToPixel } from '../../common';

const DEFAULT_ERROR_BAR_WIDTH = 4;

class ErrorBarBase extends ChartElement {
    constructor(low, high, isVertical, chart, series, options) {
        super(options);

        this.low = low;
        this.high = high;
        this.isVertical = isVertical;
        this.chart = chart;
        this.series = series;
    }

    reflow(targetBox) {
        const endCaps = this.options.endCaps;
        const isVertical = this.isVertical;
        const axis = this.getAxis();
        const valueBox = axis.getSlot(this.low, this.high);
        const centerBox = targetBox.center();
        const capsWidth = this.getCapsWidth(targetBox, isVertical);
        const capValue = isVertical ? centerBox.x : centerBox.y;
        const capStart = capValue - capsWidth;
        const capEnd = capValue + capsWidth;
        let linePoints;

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
    }

    getCapsWidth(box, isVertical) {
        const boxSize = isVertical ? box.width() : box.height();
        const capsWidth = Math.min(Math.floor(boxSize / 2), DEFAULT_ERROR_BAR_WIDTH) || DEFAULT_ERROR_BAR_WIDTH;

        return capsWidth;
    }

    createVisual() {
        const options = this.options;
        const visual = options.visual;

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
                createVisual: () => {
                    this.createDefaultVisual();
                    const defaultVisual = this.visual;
                    delete this.visual;
                    return defaultVisual;
                }
            });
        } else {
            this.createDefaultVisual();
        }
    }

    createDefaultVisual() {
        const { options, linePoints } = this;
        const lineOptions = {
            stroke: {
                color: options.color,
                width: options.line.width,
                dashType: options.line.dashType
            }
        };

        super.createVisual();

        for (let idx = 0; idx < linePoints.length; idx += 2) {
            const line = new draw.Path(lineOptions)
                .moveTo(linePoints[idx].x, linePoints[idx].y)
                .lineTo(linePoints[idx + 1].x, linePoints[idx + 1].y);

            alignPathToPixel(line);
            this.visual.append(line);
        }
    }
}

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