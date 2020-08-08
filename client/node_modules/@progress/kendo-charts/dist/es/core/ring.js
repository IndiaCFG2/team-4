import Box from './box';
import Point from './point';
import { COORD_PRECISION, MAX_VALUE, MIN_VALUE } from '../common/constants';
import { Class, clockwise, rad, round } from '../common';

var Ring = (function (Class) {
    function Ring(center, innerRadius, radius, startAngle, angle) {
        Class.call(this);

        this.center = center;
        this.innerRadius = innerRadius;
        this.radius = radius;
        this.startAngle = startAngle;
        this.angle = angle;
    }

    if ( Class ) Ring.__proto__ = Class;
    Ring.prototype = Object.create( Class && Class.prototype );
    Ring.prototype.constructor = Ring;

    Ring.prototype.clone = function clone () {
        return new Ring(this.center, this.innerRadius, this.radius, this.startAngle, this.angle);
    };

    Ring.prototype.middle = function middle () {
        return this.startAngle + this.angle / 2;
    };

    Ring.prototype.setRadius = function setRadius (newRadius, innerRadius) {
        if (innerRadius) {
            this.innerRadius = newRadius;
        } else {
            this.radius = newRadius;
        }

        return this;
    };

    // TODO: Remove and replace with Point.onCircle
    Ring.prototype.point = function point (angle, innerRadius) {
        var radianAngle = rad(angle);
        var ax = Math.cos(radianAngle);
        var ay = Math.sin(radianAngle);
        var radius = innerRadius ? this.innerRadius : this.radius;
        var x = round(this.center.x - (ax * radius), COORD_PRECISION);
        var y = round(this.center.y - (ay * radius), COORD_PRECISION);

        return new Point(x, y);
    };

    Ring.prototype.adjacentBox = function adjacentBox (distance, width, height) {
        var sector = this.clone().expand(distance);
        var midAndle = sector.middle();
        var midPoint = sector.point(midAndle);
        var hw = width / 2;
        var hh = height / 2;
        var sa = Math.sin(rad(midAndle));
        var ca = Math.cos(rad(midAndle));
        var x = midPoint.x - hw;
        var y = midPoint.y - hh;

        if (Math.abs(sa) < 0.9) {
            x += hw * -ca / Math.abs(ca);
        }

        if (Math.abs(ca) < 0.9) {
            y += hh * -sa / Math.abs(sa);
        }

        return new Box(x, y, x + width, y + height);
    };

    Ring.prototype.containsPoint = function containsPoint (p) {
        var center = this.center;
        var innerRadius = this.innerRadius;
        var radius = this.radius;
        var startAngle = this.startAngle;
        var endAngle = this.startAngle + this.angle;
        var dx = p.x - center.x;
        var dy = p.y - center.y;
        var vector = new Point(dx, dy);
        var startPoint = this.point(startAngle);
        var startVector = new Point(startPoint.x - center.x, startPoint.y - center.y);
        var endPoint = this.point(endAngle);
        var endVector = new Point(endPoint.x - center.x, endPoint.y - center.y);
        var dist = round(dx * dx + dy * dy, COORD_PRECISION);

        return (startVector.equals(vector) || clockwise(startVector, vector)) &&
               !clockwise(endVector, vector) &&
               dist >= innerRadius * innerRadius && dist <= radius * radius;
    };

    Ring.prototype.getBBox = function getBBox () {
        var this$1 = this;

        var box = new Box(MAX_VALUE, MAX_VALUE, MIN_VALUE, MIN_VALUE);
        var startAngle = round(this.startAngle % 360);
        var endAngle = round((startAngle + this.angle) % 360);
        var innerRadius = this.innerRadius;
        var allAngles = [ 0, 90, 180, 270, startAngle, endAngle ].sort(numericComparer);
        var startAngleIndex = allAngles.indexOf(startAngle);
        var endAngleIndex = allAngles.indexOf(endAngle);
        var angles;

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

        for (var i = 0; i < angles.length; i++) {
            var point = this$1.point(angles[i]);
            box.wrapPoint(point);
            box.wrapPoint(point, innerRadius);
        }

        if (!innerRadius) {
            box.wrapPoint(this.center);
        }

        return box;
    };

    Ring.prototype.expand = function expand (value) {
        this.radius += value;
        return this;
    };

    return Ring;
}(Class));

function numericComparer(a, b) {
    return a - b;
}

export default Ring;