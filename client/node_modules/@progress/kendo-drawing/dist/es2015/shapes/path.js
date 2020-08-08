import GeometryElementsArray from './geometry-elements-array';
import Element from './element';
import Paintable from '../mixins/paintable';
import Measurable from '../mixins/measurable';
import Arc from '../geometry/arc';
import Rect from '../geometry/rect';
import Segment from '../geometry/segment';
import Point from '../geometry/point';
import Size from '../geometry/size';
import lineIntersectionsCount from '../geometry/math/line-intersections-count';
import { defined, last, rad } from '../util';
import PathParser from '../parsing/path-parser';

class Path extends Element {

    constructor(options) {
        super(options);
        this.segments = new GeometryElementsArray();
        this.segments.addObserver(this);

        if (!defined(this.options.stroke)) {
            this.stroke("#000");

            if (!defined(this.options.stroke.lineJoin)) {
                this.options.set("stroke.lineJoin", "miter");
            }
        }
    }

    moveTo(x, y) {
        this.suspend();
        this.segments.elements([]);
        this.resume();

        this.lineTo(x, y);

        return this;
    }

    lineTo(x, y) {
        const point = defined(y) ? new Point(x, y) : x;
        const segment = new Segment(point);

        this.segments.push(segment);

        return this;
    }

    curveTo(controlOut, controlIn, point) {
        if (this.segments.length > 0) {
            const lastSegment = last(this.segments);
            const segment = new Segment(point, controlIn);
            this.suspend();
            lastSegment.controlOut(controlOut);
            this.resume();

            this.segments.push(segment);
        }

        return this;
    }

    arc(startAngle, endAngle, radiusX, radiusY, anticlockwise) {
        if (this.segments.length > 0) {
            const lastSegment = last(this.segments);
            const anchor = lastSegment.anchor();
            const start = rad(startAngle);
            const center = new Point(anchor.x - radiusX * Math.cos(start),
                anchor.y - radiusY * Math.sin(start));
            const arc = new Arc(center, {
                startAngle: startAngle,
                endAngle: endAngle,
                radiusX: radiusX,
                radiusY: radiusY,
                anticlockwise: anticlockwise
            });

            this._addArcSegments(arc);
        }

        return this;
    }

    arcTo(end, rx, ry, largeArc, swipe, rotation) {
        if (this.segments.length > 0) {
            const lastSegment = last(this.segments);
            const anchor = lastSegment.anchor();
            const arc = Arc.fromPoints(anchor, end, rx, ry, largeArc, swipe, rotation);

            this._addArcSegments(arc);
        }
        return this;
    }

    _addArcSegments(arc) {
        this.suspend();

        const curvePoints = arc.curvePoints();

        for (let i = 1; i < curvePoints.length; i += 3) {
            this.curveTo(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2]);
        }

        this.resume();
        this.geometryChange();
    }

    close() {
        this.options.closed = true;
        this.geometryChange();

        return this;
    }

    rawBBox() {
        return this._bbox();
    }

    _containsPoint(point) {
        const segments = this.segments;
        const length = segments.length;
        let intersectionsCount = 0;
        let previous, current;

        for (let idx = 1; idx < length; idx++) {
            previous = segments[idx - 1];
            current = segments[idx];
            intersectionsCount += previous._intersectionsTo(current, point);
        }

        if (this.options.closed || !segments[0].anchor().equals(segments[length - 1].anchor())) {
            intersectionsCount += lineIntersectionsCount(segments[0].anchor(), segments[length - 1].anchor(), point);
        }

        return intersectionsCount % 2 !== 0;
    }

    _isOnPath(point, width) {
        const segments = this.segments;
        const length = segments.length;
        const pathWidth = width || this.options.stroke.width;

        if (length > 1) {
            if (segments[0]._isOnPathTo(segments[1], point, pathWidth, "start")) {
                return true;
            }

            for (let idx = 2; idx <= length - 2; idx++) {
                if (segments[idx - 1]._isOnPathTo(segments[idx], point, pathWidth)) {
                    return true;
                }
            }

            if (segments[length - 2]._isOnPathTo(segments[length - 1], point, pathWidth, "end")) {
                return true;
            }
        }
        return false;
    }

    _bbox(matrix) {
        const segments = this.segments;
        const length = segments.length;
        let boundingBox;

        if (length === 1) {
            let anchor = segments[0].anchor().transformCopy(matrix);
            boundingBox = new Rect(anchor, Size.ZERO);
        } else if (length > 0) {
            for (let i = 1; i < length; i++) {
                let segmentBox = segments[i - 1].bboxTo(segments[i], matrix);
                if (boundingBox) {
                    boundingBox = Rect.union(boundingBox, segmentBox);
                } else {
                    boundingBox = segmentBox;
                }
            }
        }

        return boundingBox;
    }

    static fromRect(rect, options) {
        return new Path(options)
            .moveTo(rect.topLeft())
            .lineTo(rect.topRight())
            .lineTo(rect.bottomRight())
            .lineTo(rect.bottomLeft())
            .close();
    }

    static fromPoints(points, options) {
        if (points) {
            const path = new Path(options);

            for (let i = 0; i < points.length; i++) {
                let point = Point.create(points[i]);
                if (point) {
                    if (i === 0) {
                        path.moveTo(point);
                    } else {
                        path.lineTo(point);
                    }
                }
            }

            return path;
        }
    }

    static fromArc(arc, options) {
        const path = new Path(options);
        const startAngle = arc.startAngle;
        const start = arc.pointAt(startAngle);
        path.moveTo(start.x, start.y);
        path.arc(startAngle, arc.endAngle, arc.radiusX, arc.radiusY, arc.anticlockwise);
        return path;
    }
}

Path.prototype.nodeType = "Path";

Paintable.extend(Path.prototype);
Measurable.extend(Path.prototype);

Path.parse = function(str, options) {
    return PathParser.current.parse(str, options);
};

export default Path;
