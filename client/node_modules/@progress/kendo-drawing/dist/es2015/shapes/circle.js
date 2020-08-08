import GeometryCircle from '../geometry/circle';
import Paintable from '../mixins/paintable';
import Measurable from '../mixins/measurable';
import defineGeometryAccessors from '../accessors/define-geometry-accessors';
import Element from './element';
import { defined } from '../util';

const DEFAULT_STROKE = "#000";

class Circle extends Element {

    constructor(geometry = new GeometryCircle(), options = {}) {
        super(options);
        this.geometry(geometry);

        if (!defined(this.options.stroke)) {
            this.stroke(DEFAULT_STROKE);
        }
    }

    rawBBox() {
        return this._geometry.bbox();
    }

    _bbox(matrix) {
        return this._geometry.bbox(matrix);
    }

    _containsPoint(point) {
        return this.geometry().containsPoint(point);
    }

    _isOnPath(point) {
        return this.geometry()._isOnPath(point, this.options.stroke.width / 2);
    }
}

Circle.prototype.nodeType = "Circle";

Paintable.extend(Circle.prototype);
Measurable.extend(Circle.prototype);
defineGeometryAccessors(Circle.prototype, [ "geometry" ]);

export default Circle;