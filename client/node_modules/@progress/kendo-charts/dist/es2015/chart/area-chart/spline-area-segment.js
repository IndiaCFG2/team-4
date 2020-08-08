import { geometry as geom } from '@progress/kendo-drawing';
import { CurveProcessor } from '../../core';

import AreaSegment from './area-segment';

class SplineAreaSegment extends AreaSegment {

    createStrokeSegments() {
        const curveProcessor = new CurveProcessor(this.options.closed);
        const linePoints = this.points();

        return curveProcessor.process(linePoints);
    }

    createStackSegments() {
        const strokeSegments = this.strokeSegments();
        const stackSegments = [];
        for (let idx = strokeSegments.length - 1; idx >= 0; idx--) {
            const segment = strokeSegments[idx];
            stackSegments.push(new geom.Segment(
                segment.anchor(),
                segment.controlOut(),
                segment.controlIn()
            ));
        }

        return stackSegments;
    }
}

export default SplineAreaSegment;