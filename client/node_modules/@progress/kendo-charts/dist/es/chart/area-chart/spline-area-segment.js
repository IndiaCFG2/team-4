import { geometry as geom } from '@progress/kendo-drawing';
import { CurveProcessor } from '../../core';

import AreaSegment from './area-segment';

var SplineAreaSegment = (function (AreaSegment) {
    function SplineAreaSegment () {
        AreaSegment.apply(this, arguments);
    }

    if ( AreaSegment ) SplineAreaSegment.__proto__ = AreaSegment;
    SplineAreaSegment.prototype = Object.create( AreaSegment && AreaSegment.prototype );
    SplineAreaSegment.prototype.constructor = SplineAreaSegment;

    SplineAreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        var curveProcessor = new CurveProcessor(this.options.closed);
        var linePoints = this.points();

        return curveProcessor.process(linePoints);
    };

    SplineAreaSegment.prototype.createStackSegments = function createStackSegments () {
        var strokeSegments = this.strokeSegments();
        var stackSegments = [];
        for (var idx = strokeSegments.length - 1; idx >= 0; idx--) {
            var segment = strokeSegments[idx];
            stackSegments.push(new geom.Segment(
                segment.anchor(),
                segment.controlOut(),
                segment.controlIn()
            ));
        }

        return stackSegments;
    };

    return SplineAreaSegment;
}(AreaSegment));

export default SplineAreaSegment;