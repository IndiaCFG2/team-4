import GeometryElementsArray from './geometry-elements-array';
import Element from './element';
import Path from './path';
import Paintable from '../mixins/paintable';
import Measurable from '../mixins/measurable';
import elementsBoundingBox from './utils/elements-bounding-box';
import elementsClippedBoundingBox from './utils/elements-clippend-bounding-box';
import { defined, last } from '../util';

class MultiPath extends Element {

    constructor(options) {
        super(options);
        this.paths = new GeometryElementsArray();
        this.paths.addObserver(this);

        if (!defined(this.options.stroke)) {
            this.stroke("#000");
        }
    }

    moveTo(x, y) {
        const path = new Path();
        path.moveTo(x, y);

        this.paths.push(path);

        return this;
    }

    lineTo(x, y) {
        if (this.paths.length > 0) {
            last(this.paths).lineTo(x, y);
        }

        return this;
    }

    curveTo(controlOut, controlIn, point) {
        if (this.paths.length > 0) {
            last(this.paths).curveTo(controlOut, controlIn, point);
        }

        return this;
    }

    arc(startAngle, endAngle, radiusX, radiusY, anticlockwise) {
        if (this.paths.length > 0) {
            last(this.paths).arc(startAngle, endAngle, radiusX, radiusY, anticlockwise);
        }

        return this;
    }

    arcTo(end, rx, ry, largeArc, swipe, rotation) {
        if (this.paths.length > 0) {
            last(this.paths).arcTo(end, rx, ry, largeArc, swipe, rotation);
        }

        return this;
    }

    close() {
        if (this.paths.length > 0) {
            last(this.paths).close();
        }

        return this;
    }

    _bbox(matrix) {
        return elementsBoundingBox(this.paths, true, matrix);
    }

    rawBBox() {
        return elementsBoundingBox(this.paths, false);
    }

    _containsPoint(point) {
        const paths = this.paths;

        for (let idx = 0; idx < paths.length; idx++) {
            if (paths[idx]._containsPoint(point)) {
                return true;
            }
        }
        return false;
    }

    _isOnPath(point) {
        const paths = this.paths;
        const width = this.options.stroke.width;

        for (let idx = 0; idx < paths.length; idx++) {
            if (paths[idx]._isOnPath(point, width)) {
                return true;
            }
        }
        return false;
    }

    _clippedBBox(transformation) {
        return elementsClippedBoundingBox(this.paths, this.currentTransform(transformation));
    }
}

MultiPath.prototype.nodeType = "MultiPath";

Paintable.extend(MultiPath.prototype);
Measurable.extend(MultiPath.prototype);

export default MultiPath;