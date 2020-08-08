import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import toMatrix from './to-matrix';
import Matrix from './matrix';
import Point from './point';

class Transformation extends Class {

    constructor(matrix = Matrix.unit()) {
        super();

        this._matrix = matrix;
    }

    clone() {
        return new Transformation(
            this._matrix.clone()
        );
    }

    equals(other) {
        return other &&
               other._matrix.equals(this._matrix);
    }

    translate(x, y) {
        this._matrix = this._matrix.multiplyCopy(Matrix.translate(x, y));

        this._optionsChange();
        return this;
    }

    scale(scaleX, scaleY = scaleX, origin = null) {
        let originPoint = origin;

        if (originPoint) {
            originPoint = Point.create(originPoint);
            this._matrix = this._matrix.multiplyCopy(Matrix.translate(originPoint.x, originPoint.y));
        }

        this._matrix = this._matrix.multiplyCopy(Matrix.scale(scaleX, scaleY));

        if (originPoint) {
            this._matrix = this._matrix.multiplyCopy(Matrix.translate(-originPoint.x, -originPoint.y));
        }

        this._optionsChange();
        return this;
    }

    rotate(angle, origin) {
        const originPoint = Point.create(origin) || Point.ZERO;

        this._matrix = this._matrix.multiplyCopy(Matrix.rotate(angle, originPoint.x, originPoint.y));

        this._optionsChange();
        return this;
    }

    multiply(transformation) {
        const matrix = toMatrix(transformation);

        this._matrix = this._matrix.multiplyCopy(matrix);

        this._optionsChange();
        return this;
    }

    matrix(value) {
        if (value) {
            this._matrix = value;
            this._optionsChange();
            return this;
        }

        return this._matrix;
    }

    _optionsChange() {
        this.optionsChange({
            field: "transform",
            value: this
        });
    }
}

ObserversMixin.extend(Transformation.prototype);

export default Transformation;
