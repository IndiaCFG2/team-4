import { CurveProcessor } from '../../core';

import RangeAreaSegment from './range-area-segment';

var SplineRangeAreaSegment = (function (RangeAreaSegment) {
    function SplineRangeAreaSegment () {
        RangeAreaSegment.apply(this, arguments);
    }

    if ( RangeAreaSegment ) SplineRangeAreaSegment.__proto__ = RangeAreaSegment;
    SplineRangeAreaSegment.prototype = Object.create( RangeAreaSegment && RangeAreaSegment.prototype );
    SplineRangeAreaSegment.prototype.constructor = SplineRangeAreaSegment;

    SplineRangeAreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        return this.createCurveSegments(this.toPoints());
    };

    SplineRangeAreaSegment.prototype.stackSegments = function stackSegments () {
        var fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.createCurveSegments(this.fromPoints().reverse());
        }

        return fromSegments;
    };

    SplineRangeAreaSegment.prototype.createCurveSegments = function createCurveSegments (points) {
        var curveProcessor = new CurveProcessor();

        return curveProcessor.process(this.toGeometryPoints(points));
    };

    return SplineRangeAreaSegment;
}(RangeAreaSegment));

export default SplineRangeAreaSegment;