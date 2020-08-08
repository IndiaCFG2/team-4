import StepLineMixin from '../line-chart/step-line-mixin';
import RangeAreaSegment from './range-area-segment';
import { deepExtend } from '../../common';

var StepRangeAreaSegment = (function (RangeAreaSegment) {
    function StepRangeAreaSegment () {
        RangeAreaSegment.apply(this, arguments);
    }

    if ( RangeAreaSegment ) StepRangeAreaSegment.__proto__ = RangeAreaSegment;
    StepRangeAreaSegment.prototype = Object.create( RangeAreaSegment && RangeAreaSegment.prototype );
    StepRangeAreaSegment.prototype.constructor = StepRangeAreaSegment;

    StepRangeAreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        return this.segmentsFromPoints(this.calculateStepPoints(this.toPoints()));
    };

    StepRangeAreaSegment.prototype.stackSegments = function stackSegments () {
        var fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.segmentsFromPoints(this.calculateStepPoints(this.fromPoints()));
            fromSegments.reverse();
        }

        return fromSegments;
    };

    return StepRangeAreaSegment;
}(RangeAreaSegment));

deepExtend(StepRangeAreaSegment.prototype, StepLineMixin);

export default StepRangeAreaSegment;