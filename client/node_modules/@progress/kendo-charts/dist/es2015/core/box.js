import { geometry as geom } from '@progress/kendo-drawing';

import Point from './point';

import { X, Y, TOP, BOTTOM, LEFT, RIGHT, CENTER, WIDTH, HEIGHT } from '../common/constants';
import { Class, defined, getSpacing, inArray, isArray, rad } from '../common';

class Box extends Class {
    constructor(x1, y1, x2, y2) {
        super();

        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
    }

    equals(box) {
        return this.x1 === box.x1 && this.x2 === box.x2 &&
            this.y1 === box.y1 && this.y2 === box.y2;
    }

    width() {
        return this.x2 - this.x1;
    }

    height() {
        return this.y2 - this.y1;
    }

    translate(dx, dy) {
        this.x1 += dx;
        this.x2 += dx;
        this.y1 += dy;
        this.y2 += dy;

        return this;
    }

    move(x, y) {
        const height = this.height();
        const width = this.width();

        if (defined(x)) {
            this.x1 = x;
            this.x2 = this.x1 + width;
        }

        if (defined(y)) {
            this.y1 = y;
            this.y2 = this.y1 + height;
        }

        return this;
    }

    wrap(targetBox) {
        this.x1 = Math.min(this.x1, targetBox.x1);
        this.y1 = Math.min(this.y1, targetBox.y1);
        this.x2 = Math.max(this.x2, targetBox.x2);
        this.y2 = Math.max(this.y2, targetBox.y2);

        return this;
    }

    wrapPoint(point) {
        const arrayPoint = isArray(point);
        const x = arrayPoint ? point[0] : point.x;
        const y = arrayPoint ? point[1] : point.y;
        this.wrap(new Box(x, y, x, y));

        return this;
    }

    snapTo(targetBox, axis) {

        if (axis === X || !axis) {
            this.x1 = targetBox.x1;
            this.x2 = targetBox.x2;
        }

        if (axis === Y || !axis) {
            this.y1 = targetBox.y1;
            this.y2 = targetBox.y2;
        }

        return this;
    }

    alignTo(targetBox, anchor) {
        const height = this.height();
        const width = this.width();
        const axis = anchor === TOP || anchor === BOTTOM ? Y : X;
        const offset = axis === Y ? height : width;

        if (anchor === CENTER) {
            const targetCenter = targetBox.center();
            const center = this.center();

            this.x1 += targetCenter.x - center.x;
            this.y1 += targetCenter.y - center.y;
        } else if (anchor === TOP || anchor === LEFT) {
            this[axis + 1] = targetBox[axis + 1] - offset;
        } else {
            this[axis + 1] = targetBox[axis + 2];
        }

        this.x2 = this.x1 + width;
        this.y2 = this.y1 + height;

        return this;
    }

    shrink(dw, dh) {

        this.x2 -= dw;
        this.y2 -= dh;

        return this;
    }

    expand(dw, dh) {
        this.shrink(-dw, -dh);
        return this;
    }

    pad(padding) {
        const spacing = getSpacing(padding);

        this.x1 -= spacing.left;
        this.x2 += spacing.right;
        this.y1 -= spacing.top;
        this.y2 += spacing.bottom;

        return this;
    }

    unpad(padding) {
        const spacing = getSpacing(padding);

        spacing.left = -spacing.left;
        spacing.top = -spacing.top;
        spacing.right = -spacing.right;
        spacing.bottom = -spacing.bottom;

        return this.pad(spacing);
    }

    clone() {
        return new Box(this.x1, this.y1, this.x2, this.y2);
    }

    center() {
        return new Point(
            this.x1 + this.width() / 2,
            this.y1 + this.height() / 2
        );
    }

    containsPoint(point) {

        return point.x >= this.x1 && point.x <= this.x2 &&
               point.y >= this.y1 && point.y <= this.y2;
    }

    points() {
        return [
            new Point(this.x1, this.y1),
            new Point(this.x2, this.y1),
            new Point(this.x2, this.y2),
            new Point(this.x1, this.y2)
        ];
    }

    getHash() {
        return [ this.x1, this.y1, this.x2, this.y2 ].join(",");
    }

    overlaps(box) {
        return !(box.y2 < this.y1 || this.y2 < box.y1 || box.x2 < this.x1 || this.x2 < box.x1);
    }

    rotate(rotation) {
        let width = this.width();
        let height = this.height();
        const { x: cx, y: cy } = this.center();

        const r1 = rotatePoint(0, 0, cx, cy, rotation);
        const r2 = rotatePoint(width, 0, cx, cy, rotation);
        const r3 = rotatePoint(width, height, cx, cy, rotation);
        const r4 = rotatePoint(0, height, cx, cy, rotation);

        width = Math.max(r1.x, r2.x, r3.x, r4.x) - Math.min(r1.x, r2.x, r3.x, r4.x);
        height = Math.max(r1.y, r2.y, r3.y, r4.y) - Math.min(r1.y, r2.y, r3.y, r4.y);

        this.x2 = this.x1 + width;
        this.y2 = this.y1 + height;

        return this;
    }

    toRect() {
        return new geom.Rect([ this.x1, this.y1 ], [ this.width(), this.height() ]);
    }

    hasSize() {
        return this.width() !== 0 && this.height() !== 0;
    }

    align(targetBox, axis, alignment) {
        const c1 = axis + 1;
        const c2 = axis + 2;
        const sizeFunc = axis === X ? WIDTH : HEIGHT;
        const size = this[sizeFunc]();

        if (inArray(alignment, [ LEFT, TOP ])) {
            this[c1] = targetBox[c1];
            this[c2] = this[c1] + size;
        } else if (inArray(alignment, [ RIGHT, BOTTOM ])) {
            this[c2] = targetBox[c2];
            this[c1] = this[c2] - size;
        } else if (alignment === CENTER) {
            this[c1] = targetBox[c1] + (targetBox[sizeFunc]() - size) / 2;
            this[c2] = this[c1] + size;
        }
    }
}

function rotatePoint(x, y, cx, cy, angle) {
    const theta = rad(angle);

    return new Point(
        cx + (x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta),
        cy - (x - cx) * Math.sin(theta) + (y - cy) * Math.cos(theta)
    );
}

export default Box;
