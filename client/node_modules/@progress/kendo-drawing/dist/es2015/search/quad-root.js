import { Class } from '../common';

class QuadRoot extends Class {
    constructor() {
        super();

        this.shapes = [];
    }

    _add(shape, bbox) {
        this.shapes.push({
            bbox: bbox,
            shape: shape
        });
        shape._quadNode = this;
    }

    pointShapes(point) {
        const shapes = this.shapes;
        const length = shapes.length;
        const result = [];
        for (let idx = 0; idx < length; idx++) {
            if (shapes[idx].bbox.containsPoint(point)) {
                result.push(shapes[idx].shape);
            }
        }
        return result;
    }

    insert(shape, bbox) {
        this._add(shape, bbox);
    }

    remove(shape) {
        const shapes = this.shapes;
        const length = shapes.length;

        for (let idx = 0; idx < length; idx++) {
            if (shapes[idx].shape === shape) {
                shapes.splice(idx, 1);
                break;
            }
        }
    }
}

export default QuadRoot;