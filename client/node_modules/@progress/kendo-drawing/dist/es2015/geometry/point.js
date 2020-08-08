import defineAccessors from '../accessors/define-accessors';
import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import { defined, MIN_NUM, MAX_NUM, round } from '../util';
import Matrix from './matrix';
import toMatrix from './to-matrix';

class Point extends Class {

    constructor(x, y) {
        super();

        this.x = x || 0;
        this.y = y || 0;
    }

    equals(other) {
        return other && other.x === this.x && other.y === this.y;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    rotate(angle, origin) {
        const originPoint = Point.create(origin) || Point.ZERO;

        return this.transform(Matrix.rotate(angle, originPoint.x, originPoint.y));
    }

    translate(x, y) {
        this.x += x;
        this.y += y;

        this.geometryChange();

        return this;
    }

    translateWith(point) {
        return this.translate(point.x, point.y);
    }

    move(x, y) {
        this.x = this.y = 0;
        return this.translate(x, y);
    }

    scale(scaleX, scaleY = scaleX) {
        this.x *= scaleX;
        this.y *= scaleY;

        this.geometryChange();

        return this;
    }

    scaleCopy(scaleX, scaleY) {
        return this.clone().scale(scaleX, scaleY);
    }

    transform(transformation) {
        const matrix = toMatrix(transformation);
        const { x, y } = this;

        this.x = matrix.a * x + matrix.c * y + matrix.e;
        this.y = matrix.b * x + matrix.d * y + matrix.f;

        this.geometryChange();

        return this;
    }

    transformCopy(transformation) {
        const point = this.clone();

        if (transformation) {
            point.transform(transformation);
        }

        return point;
    }

    distanceTo(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    round(digits) {
        this.x = round(this.x, digits);
        this.y = round(this.y, digits);

        this.geometryChange();

        return this;
    }

    toArray(digits) {
        const doRound = defined(digits);
        const x = doRound ? round(this.x, digits) : this.x;
        const y = doRound ? round(this.y, digits) : this.y;

        return [ x, y ];
    }

    toString(digits, separator = " ") {
        let { x, y } = this;

        if (defined(digits)) {
            x = round(x, digits);
            y = round(y, digits);
        }

        return x + separator + y;
    }

    static create(arg0, arg1) {
        if (defined(arg0)) {
            if (arg0 instanceof Point) {
                return arg0;
            } else if (arguments.length === 1 && arg0.length === 2) {
                return new Point(arg0[0], arg0[1]);
            }

            return new Point(arg0, arg1);
        }
    }

    static min() {
        let minX = MAX_NUM;
        let minY = MAX_NUM;

        for (let i = 0; i < arguments.length; i++) {
            let point = arguments[i];
            minX = Math.min(point.x, minX);
            minY = Math.min(point.y, minY);
        }

        return new Point(minX, minY);
    }

    static max() {
        let maxX = MIN_NUM;
        let maxY = MIN_NUM;

        for (let i = 0; i < arguments.length; i++) {
            const point = arguments[i];
            maxX = Math.max(point.x, maxX);
            maxY = Math.max(point.y, maxY);
        }

        return new Point(maxX, maxY);
    }

    static minPoint() {
        return new Point(MIN_NUM, MIN_NUM);
    }

    static maxPoint() {
        return new Point(MAX_NUM, MAX_NUM);
    }

    static get ZERO() {
        return new Point(0, 0);
    }
}

defineAccessors(Point.prototype, [ "x", "y" ]);
ObserversMixin.extend(Point.prototype);

export default Point;
