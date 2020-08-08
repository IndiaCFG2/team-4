import StepLineMixin from '../line-chart/step-line-mixin';
import AreaSegment from './area-segment';

import { deepExtend } from '../../common';

var StepAreaSegment = (function (AreaSegment) {
    function StepAreaSegment () {
        AreaSegment.apply(this, arguments);
    }

    if ( AreaSegment ) StepAreaSegment.__proto__ = AreaSegment;
    StepAreaSegment.prototype = Object.create( AreaSegment && AreaSegment.prototype );
    StepAreaSegment.prototype.constructor = StepAreaSegment;

    StepAreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        return this.segmentsFromPoints(this.calculateStepPoints(this.linePoints));
    };

    StepAreaSegment.prototype.createStackSegments = function createStackSegments (stackPoints) {
        return this.segmentsFromPoints(this.calculateStepPoints(stackPoints)).reverse();
    };

    return StepAreaSegment;
}(AreaSegment));

deepExtend(StepAreaSegment.prototype, StepLineMixin);

export default StepAreaSegment;