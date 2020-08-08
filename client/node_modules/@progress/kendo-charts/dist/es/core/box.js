import { geometry as geom } from '@progress/kendo-drawing';

import Point from './point';

import { X, Y, TOP, BOTTOM, LEFT, RIGHT, CENTER, WIDTH, HEIGHT } from '../common/constants';
import { Class, defined, getSpacing, inArray, isArray, rad } from '../common';

var Box = (function (Class) {
    function Box(x1, y1, x2, y2) {
        Class.call(this);

        this.x1 = x1 || 0;
        this.y1 = y1 || 0;
        this.x2 = x2 || 0;
        this.y2 = y2 || 0;
    }

    if ( Class ) Box.__proto__ = Class;
    Box.prototype = Object.create( Class && Class.prototype );
    Box.prototype.constructor = Box;

    Box.prototype.equals = function equals (box) {
        return this.x1 === box.x1 && this.x2 === box.x2 &&
            this.y1 === box.y1 && this.y2 === box.y2;
    };

    Box.prototype.width = function width () {
        return this.x2 - this.x1;
    };

    Box.prototype.height = function height () {
        return this.y2 - this.y1;
    };

    Box.prototype.translate = function translate (dx, dy) {
        this.x1 += dx;
        this.x2 += dx;
        this.y1 += dy;
        this.y2 += dy;

        return this;
    };

    Box.prototype.move = function move (x, y) {
        var height = this.height();
        var width = this.width();

        if (defined(x)) {
            this.x1 = x;
            this.x2 = this.x1 + width;
        }

        if (defined(y)) {
            this.y1 = y;
            this.y2 = this.y1 + height;
        }

        return this;
    };

    Box.prototype.wrap = function wrap (targetBox) {
        this.x1 = Math.min(this.x1, targetBox.x1);
        this.y1 = Math.min(this.y1, targetBox.y1);
        this.x2 = Math.max(this.x2, targetBox.x2);
        this.y2 = Math.max(this.y2, targetBox.y2);

        return this;
    };

    Box.prototype.wrapPoint = function wrapPoint (point) {
        var arrayPoint = isArray(point);
        var x = arrayPoint ? point[0] : point.x;
        var y = arrayPoint ? point[1] : point.y;
        this.wrap(new Box(x, y, x, y));

        return this;
    };

    Box.prototype.snapTo = function snapTo (targetBox, axis) {

        if (axis === X || !axis) {
            this.x1 = targetBox.x1;
            this.x2 = targetBox.x2;
        }

        if (axis === Y || !axis) {
            this.y1 = targetBox.y1;
            this.y2 = targetBox.y2;
        }

        return this;
    };

    Box.prototype.alignTo = function alignTo (targetBox, anchor) {
        var height = this.height();
        var width = this.width();
        var axis = anchor === TOP || anchor === BOTTOM ? Y : X;
        var offset = axis === Y ? height : width;

        if (anchor === CENTER) {
            var targetCenter = targetBox.center();
            var center = this.center();

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
    };

    Box.prototype.shrink = function shrink (dw, dh) {

        this.x2 -= dw;
        this.y2 -= dh;

        return this;
    };

    Box.prototype.expand = function expand (dw, dh) {
        this.shrink(-dw, -dh);
        return this;
    };

    Box.prototype.pad = function pad (padding) {
        var spacing = getSpacing(padding);

        this.x1 -= spacing.left;
        this.x2 += spacing.right;
        this.y1 -= spacing.top;
        this.y2 += spacing.bottom;

        return this;
    };

    Box.prototype.unpad = function unpad (padding) {
        var spacing = getSpacing(padding);

        spacing.left = -spacing.left;
        spacing.top = -spacing.top;
        spacing.right = -spacing.right;
        spacing.bottom = -spacing.bottom;

        return this.pad(spacing);
    };

    Box.prototype.clone = function clone () {
        return new Box(this.x1, this.y1, this.x2, this.y2);
    };

    Box.prototype.center = function center () {
        return new Point(
            this.x1 + this.width() / 2,
            this.y1 + this.height() / 2
        );
    };

    Box.prototype.containsPoint = function containsPoint (point) {

        return point.x >= this.x1 && point.x <= this.x2 &&
               point.y >= this.y1 && point.y <= this.y2;
    };

    Box.prototype.points = function points () {
        return [
            new Point(this.x1, this.y1),
            new Point(this.x2, this.y1),
            new Point(this.x2, this.y2),
            new Point(this.x1, this.y2)
        ];
    };

    Box.prototype.getHash = function getHash () {
        return [ this.x1, this.y1, this.x2, this.y2 ].join(",");
    };

    Box.prototype.overlaps = function overlaps (box) {
        return !(box.y2 < this.y1 || this.y2 < box.y1 || box.x2 < this.x1 || this.x2 < box.x1);
    };

    Box.prototype.rotate = function rotate (rotation) {
        var width = this.width();
        var height = this.height();
        var ref = this.center();
        var cx = ref.x;
        var cy = ref.y;

        var r1 = rotatePoint(0, 0, cx, cy, rotation);
        var r2 = rotatePoint(width, 0, cx, cy, rotation);
        var r3 = rotatePoint(width, height, cx, cy, rotation);
        var r4 = rotatePoint(0, height, cx, cy, rotation);

        width = Math.max(r1.x, r2.x, r3.x, r4.x) - Math.min(r1.x, r2.x, r3.x, r4.x);
        height = Math.max(r1.y, r2.y, r3.y, r4.y) - Math.min(r1.y, r2.y, r3.y, r4.y);

        this.x2 = this.x1 + width;
        this.y2 = this.y1 + height;

        return this;
    };

    Box.prototype.toRect = function toRect () {
        return new geom.Rect([ this.x1, this.y1 ], [ this.width(), this.height() ]);
    };

    Box.prototype.hasSize = function hasSize () {
        return this.width() !== 0 && this.height() !== 0;
    };

    Box.prototype.align = function align (targetBox, axis, alignment) {
        var c1 = axis + 1;
        var c2 = axis + 2;
        var sizeFunc = axis === X ? WIDTH : HEIGHT;
        var size = this[sizeFunc]();

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
    };

    return Box;
}(Class));

function rotatePoint(x, y, cx, cy, angle) {
    var theta = rad(angle);

    return new Point(
        cx + (x - cx) * Math.cos(theta) + (y - cy) * Math.sin(theta),
        cy - (x - cx) * Math.sin(theta) + (y - cy) * Math.cos(theta)
    );
}

export default Box;
