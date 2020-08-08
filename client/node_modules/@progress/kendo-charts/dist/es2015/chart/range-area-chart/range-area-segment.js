import { drawing as draw } from '@progress/kendo-drawing';
import AreaSegment from '../area-chart/area-segment';

class RangeAreaSegment extends AreaSegment {

    createStrokeSegments() {
        return this.segmentsFromPoints(this.toGeometryPoints(this.toPoints()));
    }

    stackSegments() {
        let fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.segmentsFromPoints(this.toGeometryPoints(this.fromPoints().reverse()));
        }

        return fromSegments;
    }

    createStroke(style) {
        const toPath = new draw.Path(style);
        const fromPath = new draw.Path(style);

        toPath.segments.push.apply(toPath.segments, this.strokeSegments());
        fromPath.segments.push.apply(fromPath.segments, this.stackSegments());

        this.visual.append(toPath);
        this.visual.append(fromPath);
    }

    hasStackSegment() {
        return true;
    }

    fromPoints() {
        return this.linePoints.map(point => point.fromPoint);
    }

    toPoints() {
        return this.linePoints.map(point => point.toPoint);
    }
}

export default RangeAreaSegment;