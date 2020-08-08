import { drawing as draw } from '@progress/kendo-drawing';

import LineSegment from './line-segment';

import { CurveProcessor } from '../../core';

import { isFunction } from '../../common';

var SplineSegment = (function (LineSegment) {
    function SplineSegment () {
        LineSegment.apply(this, arguments);
    }

    if ( LineSegment ) SplineSegment.__proto__ = LineSegment;
    SplineSegment.prototype = Object.create( LineSegment && LineSegment.prototype );
    SplineSegment.prototype.constructor = SplineSegment;

    SplineSegment.prototype.segmentVisual = function segmentVisual () {
        var series = this.series;
        var defaults = series._defaults;
        var color = series.color;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        var curveProcessor = new CurveProcessor(this.options.closed);
        var segments = curveProcessor.process(this.points());
        var curve = new draw.Path({
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
    };

    return SplineSegment;
}(LineSegment));

export default SplineSegment;