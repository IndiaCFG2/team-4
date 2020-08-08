import { drawing as draw } from '@progress/kendo-drawing';

import LineSegment from './line-segment';

import { CurveProcessor } from '../../core';

import { isFunction } from '../../common';

class SplineSegment extends LineSegment {
    segmentVisual() {
        const series = this.series;
        const defaults = series._defaults;
        let color = series.color;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        const curveProcessor = new CurveProcessor(this.options.closed);
        const segments = curveProcessor.process(this.points());
        const curve = new draw.Path({
            stroke: {
                color: color,
                width: series.width,
                opacity: series.opacity,
                dashType: series.dashType
            },
            zIndex: series.zIndex
        });

        curve.segments.push.apply(curve.segments, segments);

        this.visual = curve;
    }
}

export default SplineSegment;