import defineAccessors from '../accessors/define-accessors';
import ObserversMixin from '../mixins/observers-mixin';
import Point from './point';
import Rect from './rect';
import ellipseExtremeAngles from './math/ellipse-extreme-angles';
import { Class } from '../common';
import { rad } from '../util';

const PI_DIV_2 = Math.PI / 2;

class Circle extends Class {

    constructor(center = new Point(), radius = 0) {
        super();

        this.setCenter(center);
        this.setRadius(radius);
    }

    setCenter(value) {
        this._observerField("center", Point.create(value));
        this.geometryChange();
        return this;
    }

    getCenter() {
        return this.center;
    }

    equals(other) {
        return other &&
               other.center.equals(this.center) &&
               other.radius === this.radius;
    }

    clone() {
        return new Circle(this.center.clone(), this.radius);
    }

    pointAt(angle) {
        return this._pointAt(rad(angle));
    }

    bbox(matrix) {
        const extremeAngles = ellipseExtremeAngles(this.center, this.radius, this.radius, matrix);
        let minPoint = Point.maxPoint();
        let maxPoint = Point.minPoint();

        for (let i = 0; i < 4; i++) {
            let currentPointX = this._pointAt(extremeAngles.x + i * PI_DIV_2).transformCopy(matrix);
            let currentPointY = this._pointAt(extremeAngles.y + i * PI_DIV_2).transformCopy(matrix);
            let currentPoint = new Point(currentPointX.x, currentPointY.y);

            minPoint = Point.min(minPoint, currentPoint);
            maxPoint = Point.max(maxPoint, currentPoint);
        }

        return Rect.fromPoints(minPoint, maxPoint);
    }

    _pointAt(angle) {
        const { center, radius } = this;

        return new Point(
            center.x + radius * Math.cos(angle),
            center.y + radius * Math.sin(angle)
        );
    }

    containsPoint(point) {
        const { center, radius } = this;
        const inCircle = Math.pow(point.x - center.x, 2) +
            Math.pow(point.y - center.y, 2) <= Math.pow(radius, 2);
        return inCircle;
    }

    _isOnPath(point, width) {
        const { center, radius } = this;
        const pointDistance = center.distanceTo(point);

        return radius - width <= pointDistance && pointDistance <= radius + width;
    }
}

defineAccessors(Circle.prototype, [ "radius" ]);
ObserversMixin.extend(Circle.prototype);

export default Circle;