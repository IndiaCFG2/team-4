import LineSegment from './line-segment';
import StepLineMixin from './step-line-mixin';
import { deepExtend } from '../../common';

class StepLineSegment extends LineSegment {
    points() {
        return this.calculateStepPoints(this.linePoints);
    }
}

deepExtend(StepLineSegment.prototype, StepLineMixin);

export default StepLineSegment;