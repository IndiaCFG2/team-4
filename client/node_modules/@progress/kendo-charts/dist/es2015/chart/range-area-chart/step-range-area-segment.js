import StepLineMixin from '../line-chart/step-line-mixin';
import RangeAreaSegment from './range-area-segment';
import { deepExtend } from '../../common';

class StepRangeAreaSegment extends RangeAreaSegment {

    createStrokeSegments() {
        return this.segmentsFromPoints(this.calculateStepPoints(this.toPoints()));
    }

    stackSegments() {
        let fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.segmentsFromPoints(this.calculateStepPoints(this.fromPoints()));
            fromSegments.reverse();
        }

        return fromSegments;
    }
}

deepExtend(StepRangeAreaSegment.prototype, StepLineMixin);

export default StepRangeAreaSegment;