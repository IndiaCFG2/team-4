import LineSegment from './line-segment';
import StepLineMixin from './step-line-mixin';
import { deepExtend } from '../../common';

var StepLineSegment = (function (LineSegment) {
    function StepLineSegment () {
        LineSegment.apply(this, arguments);
    }

    if ( LineSegment ) StepLineSegment.__proto__ = LineSegment;
    StepLineSegment.prototype = Object.create( LineSegment && LineSegment.prototype );
    StepLineSegment.prototype.constructor = StepLineSegment;

    StepLineSegment.prototype.points = function points () {
        return this.calculateStepPoints(this.linePoints);
    };

    return StepLineSegment;
}(LineSegment));

deepExtend(StepLineSegment.prototype, StepLineMixin);

export default StepLineSegment;