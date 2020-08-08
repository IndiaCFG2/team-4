import QuadRoot from './quad-root';
import { Rect } from '../geometry';
import { append } from '../util';

class QuadNode extends QuadRoot {
    constructor(rect) {
        super();
        this.children = [];
        this.rect = rect;
    }

    inBounds(rect) {
        const nodeRect = this.rect;
        const nodeBottomRight = nodeRect.bottomRight();
        const bottomRight = rect.bottomRight();
        const inBounds = nodeRect.origin.x <= rect.origin.x && nodeRect.origin.y <= rect.origin.y && bottomRight.x <= nodeBottomRight.x &&
            bottomRight.y <= nodeBottomRight.y;
        return inBounds;
    }

    pointShapes(point) {
        const children = this.children;
        const length = children.length;
        const result = super.pointShapes(point);
        for (let idx = 0; idx < length; idx++) {
            append(result, children[idx].pointShapes(point));
        }
        return result;
    }

    insert(shape, bbox) {
        const children = this.children;
        let inserted = false;

        if (this.inBounds(bbox)) {
            if (this.shapes.length < 4) {
                this._add(shape, bbox);
            } else {
                if (!children.length) {
                    this._initChildren();
                }

                for (let idx = 0; idx < children.length; idx++) {
                    if (children[idx].insert(shape, bbox)) {
                        inserted = true;
                        break;
                    }
                }

                if (!inserted) {
                    this._add(shape, bbox);
                }
            }
            inserted = true;
        }

        return inserted;
    }

    _initChildren() {
        const { rect, children } = this;
        const center = rect.center();
        const halfWidth = rect.width() / 2;
        const halfHeight = rect.height() / 2;

        children.push(
            new QuadNode(new Rect([ rect.origin.x, rect.origin.y ], [ halfWidth, halfHeight ])),
            new QuadNode(new Rect([ center.x, rect.origin.y ], [ halfWidth, halfHeight ])),
            new QuadNode(new Rect([ rect.origin.x, center.y ], [ halfWidth, halfHeight ])),
            new QuadNode(new Rect([ center.x, center.y ], [ halfWidth, halfHeight ]))
        );
    }
}

export default QuadNode;