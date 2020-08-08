import StepLineMixin from '../line-chart/step-line-mixin';
import AreaSegment from './area-segment';

import { deepExtend } from '../../common';

class StepAreaSegment extends AreaSegment {

    createStrokeSegments() {
        return this.segmentsFromPoints(this.calculateStepPoints(this.linePoints));
    }

    createStackSegments(stackPoints) {
        return this.segmentsFromPoints(this.calculateStepPoints(stackPoints)).reverse();
    }
}

deepExtend(StepAreaSegment.prototype, StepLineMixin);

export default StepAreaSegment;