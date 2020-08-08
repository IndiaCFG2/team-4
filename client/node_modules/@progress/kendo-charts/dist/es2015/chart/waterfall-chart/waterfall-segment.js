import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement } from '../../core';

import { FADEIN, INITIAL_ANIMATION_DURATION } from '../constants';

import { alignPathToPixel, setDefaultOptions } from '../../common';

class WaterfallSegment extends ChartElement {
    constructor(from, to, series) {
        super();

        this.from = from;
        this.to = to;
        this.series = series;
    }

    linePoints() {
        const from = this.from;
        const { from: { box: fromBox }, to: { box: toBox } } = this;
        const points = [];

        if (from.isVertical) {
            const y = from.aboveAxis ? fromBox.y1 : fromBox.y2;
            points.push(
                [ fromBox.x1, y ],
                [ toBox.x2, y ]
            );
        } else {
            const x = from.aboveAxis ? fromBox.x2 : fromBox.x1;
            points.push(
                [ x, fromBox.y1 ],
                [ x, toBox.y2 ]
            );
        }

        return points;
    }

    createVisual() {
        super.createVisual();

        const line = this.series.line || {};

        const path = draw.Path.fromPoints(this.linePoints(), {
            stroke: {
                color: line.color,
                width: line.width,
                opacity: line.opacity,
                dashType: line.dashType
            }
        });

        alignPathToPixel(path);
        this.visual.append(path);
    }
}

setDefaultOptions(WaterfallSegment, {
    animation: {
        type: FADEIN,
        delay: INITIAL_ANIMATION_DURATION
    }
});

export default WaterfallSegment;