import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import Point from './point';
import Size from './size';

class Rect extends Class {
    constructor(origin = new Point(), size = new Size()) {
        super();

        this.setOrigin(origin);
        this.setSize(size);
    }

    clone() {
        return new Rect(
            this.origin.clone(),
            this.size.clone()
        );
    }

    equals(other) {
        return other &&
               other.origin.equals(this.origin) &&
               other.size.equals(this.size);
    }

    setOrigin(value) {
        this._observerField("origin", Point.create(value));
        this.geometryChange();
        return this;
    }

    getOrigin() {
        return this.origin;
    }

    setSize(value) {
        this._observerField("size", Size.create(value));
        this.geometryChange();
        return this;
    }

    getSize() {
        return this.size;
    }

    width() {
        return this.size.width;
    }

    height() {
        return this.size.height;
    }

    topLeft() {
        return this.origin.clone();
    }

    bottomRight() {
        return this.origin.clone().translate(this.width(), this.height());
    }

    topRight() {
        return this.origin.clone().translate(this.width(), 0);
    }

    bottomLeft() {
        return this.origin.clone().translate(0, this.height());
    }

    center() {
        return this.origin.clone().translate(this.width() / 2, this.height() / 2);
    }

    bbox(matrix) {
        const tl = this.topLeft().transformCopy(matrix);
        const tr = this.topRight().transformCopy(matrix);
        const br = this.bottomRight().transformCopy(matrix);
        const bl = this.bottomLeft().transformCopy(matrix);

        return Rect.fromPoints(tl, tr, br, bl);
    }

    transformCopy(m) {
        return Rect.fromPoints(
            this.topLeft().transform(m),
            this.bottomRight().transform(m)
        );
    }

    expand(x, y = x) {

        this.size.width += 2 * x;
        this.size.height += 2 * y;

        this.origin.translate(-x, -y);

        return this;
    }

    expandCopy(x, y) {
        return this.clone().expand(x, y);
    }

    containsPoint(point) {
        const origin = this.origin;
        const bottomRight = this.bottomRight();
        return !(point.x < origin.x || point.y < origin.y || bottomRight.x < point.x || bottomRight.y < point.y);
    }

    _isOnPath(point, width) {
        const rectOuter = this.expandCopy(width, width);
        const rectInner = this.expandCopy(-width, -width);

        return rectOuter.containsPoint(point) && !rectInner.containsPoint(point);
    }

    static fromPoints() {
        const topLeft = Point.min.apply(null, arguments);
        const bottomRight = Point.max.apply(null, arguments);
        const size = new Size(
            bottomRight.x - topLeft.x,
            bottomRight.y - topLeft.y
        );

        return new Rect(topLeft, size);
    }

    static union(a, b) {
        return Rect.fromPoints(
            Point.min(a.topLeft(), b.topLeft()),
            Point.max(a.bottomRight(), b.bottomRight())
        );
    }

    static intersect(a, b) {
        const rect1 = {
            left: a.topLeft().x,
            top: a.topLeft().y,
            right: a.bottomRight().x,
            bottom: a.bottomRight().y
        };

        const rect2 = {
            left: b.topLeft().x,
            top: b.topLeft().y,
            right: b.bottomRight().x,
            bottom: b.bottomRight().y
        };

        if (rect1.left <= rect2.right &&
            rect2.left <= rect1.right &&
            rect1.top <= rect2.bottom &&
            rect2.top <= rect1.bottom) {
            return Rect.fromPoints(
                new Point(Math.max(rect1.left, rect2.left), Math.max(rect1.top, rect2.top)),
                new Point(Math.min(rect1.right, rect2.right), Math.min(rect1.bottom, rect2.bottom))
            );
        }
    }
}

ObserversMixin.extend(Rect.prototype);

export default Rect;