import { CurveProcessor } from '../../core';

import RangeAreaSegment from './range-area-segment';

class SplineRangeAreaSegment extends RangeAreaSegment {

    createStrokeSegments() {
        return this.createCurveSegments(this.toPoints());
    }

    stackSegments() {
        let fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.createCurveSegments(this.fromPoints().reverse());
        }

        return fromSegments;
    }

    createCurveSegments(points) {
        const curveProcessor = new CurveProcessor();

        return curveProcessor.process(this.toGeometryPoints(points));
    }


}

export default SplineRangeAreaSegment;