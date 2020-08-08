import GeometryArc from '../geometry/arc';
import Element from './element';
import Path from './path';
import Paintable from '../mixins/paintable';
import Measurable from '../mixins/measurable';
import defineGeometryAccessors from '../accessors/define-geometry-accessors';
import { defined } from '../util';

const DEFAULT_STROKE = "#000";

class Arc extends Element {

    constructor(geometry = new GeometryArc(), options = {}) {
        super(options);

        this.geometry(geometry);

        if (!defined(this.options.stroke)) {
            this.stroke(DEFAULT_STROKE);
        }
    }

    _bbox(matrix) {
        return this._geometry.bbox(matrix);
    }

    rawBBox() {
        return this.geometry().bbox();
    }

    toPath() {
        const path = new Path();
        const curvePoints = this.geometry().curvePoints();

        if (curvePoints.length > 0) {
            path.moveTo(curvePoints[0].x, curvePoints[0].y);

            for (let i = 1; i < curvePoints.length; i += 3) {
                path.curveTo(curvePoints[i], curvePoints[i + 1], curvePoints[i + 2]);
            }
        }

        return path;
    }

    _containsPoint(point) {
        return this.geometry().containsPoint(point);
    }

    _isOnPath(point) {
        return this.geometry()._isOnPath(point, this.options.stroke.width / 2);
    }
}

Arc.prototype.nodeType = "Arc";

Paintable.extend(Arc.prototype);
Measurable.extend(Arc.prototype);
defineGeometryAccessors(Arc.prototype, [ "geometry" ]);

export default Arc;