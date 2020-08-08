import SplineAreaSegment from '../area-chart/spline-area-segment';
import { CurveProcessor } from '../../core';

class SplinePolarAreaSegment extends SplineAreaSegment {
    fillToAxes(fillPath) {
        const center = this._polarAxisCenter();
        fillPath.lineTo(center.x, center.y);
    }

    _polarAxisCenter() {
        const polarAxis = this.parent.plotArea.polarAxis;
        const center = polarAxis.box.center();
        return center;
    }

    strokeSegments() {
        let segments = this._strokeSegments;

        if (!segments) {
            const center = this._polarAxisCenter();
            const curveProcessor = new CurveProcessor(false);
            const linePoints = this.points();

            linePoints.push(center);
            segments = this._strokeSegments = curveProcessor.process(linePoints);
            segments.pop();
        }

        return segments;
    }
}

export default SplinePolarAreaSegment;