import defineGeometryAccessors from '../accessors/define-geometry-accessors';
import Element from './element';
import Paintable from '../mixins/paintable';
import Measurable from '../mixins/measurable';
import GeometryRect from '../geometry/rect';
import { defined } from '../util';

class Rect extends Element {

    constructor(geometry = new GeometryRect(), options = {}) {
        super(options);
        this.geometry(geometry);

        if (!defined(this.options.stroke)) {
            this.stroke("#000");
        }
    }

    _bbox(matrix) {
        return this._geometry.bbox(matrix);
    }

    rawBBox() {
        return this._geometry.bbox();
    }

    _containsPoint(point) {
        return this._geometry.containsPoint(point);
    }

    _isOnPath(point) {
        return this.geometry()._isOnPath(point, this.options.stroke.width / 2);
    }
}

Rect.prototype.nodeType = "Rect";

Paintable.extend(Rect.prototype);
Measurable.extend(Rect.prototype);
defineGeometryAccessors(Rect.prototype, [ "geometry" ]);

export default Rect;

