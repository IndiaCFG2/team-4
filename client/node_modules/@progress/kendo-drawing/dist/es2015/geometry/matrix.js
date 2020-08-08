import { Class } from '../common';
import { defined, rad, round } from '../util';

class Matrix extends Class {

    constructor(a = 0, b = 0, c = 0, d = 0, e = 0, f = 0) {
        super();

        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
    }

    multiplyCopy(matrix) {
        return new Matrix(
            this.a * matrix.a + this.c * matrix.b,
            this.b * matrix.a + this.d * matrix.b,
            this.a * matrix.c + this.c * matrix.d,
            this.b * matrix.c + this.d * matrix.d,
            this.a * matrix.e + this.c * matrix.f + this.e,
            this.b * matrix.e + this.d * matrix.f + this.f
        );
    }

    invert() {
        const { a, b, c: d, d: e, e: g, f: h } = this;
        const det = a * e - b * d;

        if (det === 0) {
            return null;
        }

        return new Matrix(e / det, -b / det, -d / det, a / det,
                          (d * h - e * g) / det, (b * g - a * h) / det);
    }

    clone() {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    }

    equals(other) {
        if (!other) {
            return false;
        }

        return this.a === other.a && this.b === other.b &&
               this.c === other.c && this.d === other.d &&
               this.e === other.e && this.f === other.f;
    }

    round(precision) {
        this.a = round(this.a, precision);
        this.b = round(this.b, precision);
        this.c = round(this.c, precision);
        this.d = round(this.d, precision);
        this.e = round(this.e, precision);
        this.f = round(this.f, precision);

        return this;
    }

    toArray(precision) {
        const result = [ this.a, this.b, this.c, this.d, this.e, this.f ];

        if (defined(precision)) {
            for (let i = 0; i < result.length; i++) {
                result[i] = round(result[i], precision);
            }
        }

        return result;
    }

    toString(precision, separator = ",") {
        return this.toArray(precision).join(separator);
    }

    static translate(x, y) {
        return new Matrix(1, 0, 0, 1, x, y);
    }

    static unit() {
        return new Matrix(1, 0, 0, 1, 0, 0);
    }

    static rotate(angle, x, y) {
        const matrix = new Matrix();
        matrix.a = Math.cos(rad(angle));
        matrix.b = Math.sin(rad(angle));
        matrix.c = -matrix.b;
        matrix.d = matrix.a;
        matrix.e = (x - x * matrix.a + y * matrix.b) || 0;
        matrix.f = (y - y * matrix.a - x * matrix.b) || 0;

        return matrix;
    }

    static scale(scaleX, scaleY) {
        return new Matrix(scaleX, 0, 0, scaleY, 0, 0);
    }
}

Matrix.IDENTITY = Matrix.unit();

export default Matrix;