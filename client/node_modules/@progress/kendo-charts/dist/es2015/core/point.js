import { COORD_PRECISION } from '../common/constants';
import { Class, rad, round } from '../common';

class Point extends Class {
    constructor(x, y) {
        super();

        this.x = x || 0;
        this.y = y || 0;
    }

    clone() {
        return new Point(this.x, this.y);
    }

    equals(point) {
        return point && this.x === point.x && this.y === point.y;
    }

    rotate(center, degrees) {
        const theta = rad(degrees);
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const { x: cx, y: cy } = center;
        const { x, y } = this;

        this.x = round(
            cx + (x - cx) * cosT + (y - cy) * sinT,
            COORD_PRECISION
        );

        this.y = round(
            cy + (y - cy) * cosT - (x - cx) * sinT,
            COORD_PRECISION
        );

        return this;
    }

    multiply(a) {

        this.x *= a;
        this.y *= a;

        return this;
    }

    distanceTo(point) {
        const dx = this.x - point.x;
        const dy = this.y - point.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    static onCircle(center, angle, radius) {
        const radians = rad(angle);

        return new Point(
            center.x - radius * Math.cos(radians),
            center.y - radius * Math.sin(radians)
        );
    }
}


export default Point;