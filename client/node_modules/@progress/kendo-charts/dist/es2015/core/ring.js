import Box from './box';
import Point from './point';
import { COORD_PRECISION, MAX_VALUE, MIN_VALUE } from '../common/constants';
import { Class, clockwise, rad, round } from '../common';

class Ring extends Class {

    constructor(center, innerRadius, radius, startAngle, angle) {
        super();

        this.center = center;
        this.innerRadius = innerRadius;
        this.radius = radius;
        this.startAngle = startAngle;
        this.angle = angle;
    }

    clone() {
        return new Ring(this.center, this.innerRadius, this.radius, this.startAngle, this.angle);
    }

    middle() {
        return this.startAngle + this.angle / 2;
    }

    setRadius(newRadius, innerRadius) {
        if (innerRadius) {
            this.innerRadius = newRadius;
        } else {
            this.radius = newRadius;
        }

        return this;
    }

    // TODO: Remove and replace with Point.onCircle
    point(angle, innerRadius) {
        const radianAngle = rad(angle);
        const ax = Math.cos(radianAngle);
        const ay = Math.sin(radianAngle);
        const radius = innerRadius ? this.innerRadius : this.radius;
        const x = round(this.center.x - (ax * radius), COORD_PRECISION);
        const y = round(this.center.y - (ay * radius), COORD_PRECISION);

        return new Point(x, y);
    }

    adjacentBox(distance, width, height) {
        const sector = this.clone().expand(distance);
        const midAndle = sector.middle();
        const midPoint = sector.point(midAndle);
        const hw = width / 2;
        const hh = height / 2;
        const sa = Math.sin(rad(midAndle));
        const ca = Math.cos(rad(midAndle));
        let x = midPoint.x - hw;
        let y = midPoint.y - hh;

        if (Math.abs(sa) < 0.9) {
            x += hw * -ca / Math.abs(ca);
        }

        if (Math.abs(ca) < 0.9) {
            y += hh * -sa / Math.abs(sa);
        }

        return new Box(x, y, x + width, y + height);
    }

    containsPoint(p) {
        const center = this.center;
        const innerRadius = this.innerRadius;
        const radius = this.radius;
        const startAngle = this.startAngle;
        const endAngle = this.startAngle + this.angle;
        const dx = p.x - center.x;
        const dy = p.y - center.y;
        const vector = new Point(dx, dy);
        const startPoint = this.point(startAngle);
        const startVector = new Point(startPoint.x - center.x, startPoint.y - center.y);
        const endPoint = this.point(endAngle);
        const endVector = new Point(endPoint.x - center.x, endPoint.y - center.y);
        const dist = round(dx * dx + dy * dy, COORD_PRECISION);

        return (startVector.equals(vector) || clockwise(startVector, vector)) &&
               !clockwise(endVector, vector) &&
               dist >= innerRadius * innerRadius && dist <= radius * radius;
    }

    getBBox() {
        const box = new Box(MAX_VALUE, MAX_VALUE, MIN_VALUE, MIN_VALUE);
        const startAngle = round(this.startAngle % 360);
        const endAngle = round((startAngle + this.angle) % 360);
        const innerRadius = this.innerRadius;
        const allAngles = [ 0, 90, 180, 270, startAngle, endAngle ].sort(numericComparer);
        const startAngleIndex = allAngles.indexOf(startAngle);
        const endAngleIndex = allAngles.indexOf(endAngle);
        let angles;

        if (startAngle === endAngle) {
            angles = allAngles;
        } else {
            if (startAngleIndex < endAngleIndex) {
                angles = allAngles.slice(startAngleIndex, endAngleIndex + 1);
            } else {
                angles = [].concat(
                    allAngles.slice(0, endAngleIndex + 1),
                    allAngles.slice(startAngleIndex, allAngles.length)
                );
            }
        }

        for (let i = 0; i < angles.length; i++) {
            let point = this.point(angles[i]);
            box.wrapPoint(point);
            box.wrapPoint(point, innerRadius);
        }

        if (!innerRadius) {
            box.wrapPoint(this.center);
        }

        return box;
    }

    expand(value) {
        this.radius += value;
        return this;
    }
}

function numericComparer(a, b) {
    return a - b;
}

export default Ring;