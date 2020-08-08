import { drawing as draw } from '@progress/kendo-drawing';
import AreaSegment from '../area-chart/area-segment';

var RangeAreaSegment = (function (AreaSegment) {
    function RangeAreaSegment () {
        AreaSegment.apply(this, arguments);
    }

    if ( AreaSegment ) RangeAreaSegment.__proto__ = AreaSegment;
    RangeAreaSegment.prototype = Object.create( AreaSegment && AreaSegment.prototype );
    RangeAreaSegment.prototype.constructor = RangeAreaSegment;

    RangeAreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        return this.segmentsFromPoints(this.toGeometryPoints(this.toPoints()));
    };

    RangeAreaSegment.prototype.stackSegments = function stackSegments () {
        var fromSegments = this.fromSegments;
        if (!this.fromSegments) {
            fromSegments = this.fromSegments = this.segmentsFromPoints(this.toGeometryPoints(this.fromPoints().reverse()));
        }

        return fromSegments;
    };

    RangeAreaSegment.prototype.createStroke = function createStroke (style) {
        var toPath = new draw.Path(style);
        var fromPath = new draw.Path(style);

        toPath.segments.push.apply(toPath.segments, this.strokeSegments());
        fromPath.segments.push.apply(fromPath.segments, this.stackSegments());

        this.visual.append(toPath);
        this.visual.append(fromPath);
    };

    RangeAreaSegment.prototype.hasStackSegment = function hasStackSegment () {
        return true;
    };

    RangeAreaSegment.prototype.fromPoints = function fromPoints () {
        return this.linePoints.map(function (point) { return point.fromPoint; });
    };

    RangeAreaSegment.prototype.toPoints = function toPoints () {
        return this.linePoints.map(function (point) { return point.toPoint; });
    };

    return RangeAreaSegment;
}(AreaSegment));

export default RangeAreaSegment;