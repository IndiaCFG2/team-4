import { COORD_PRECISION } from '../common/constants';
import { Class, rad, round } from '../common';

var Point = (function (Class) {
    function Point(x, y) {
        Class.call(this);

        this.x = x || 0;
        this.y = y || 0;
    }

    if ( Class ) Point.__proto__ = Class;
    Point.prototype = Object.create( Class && Class.prototype );
    Point.prototype.constructor = Point;

    Point.prototype.clone = function clone () {
        return new Point(this.x, this.y);
    };

    Point.prototype.equals = function equals (point) {
        return point && this.x === point.x && this.y === point.y;
    };

    Point.prototype.rotate = function rotate (center, degrees) {
        var theta = rad(degrees);
        var cosT = Math.cos(theta);
        var sinT = Math.sin(theta);
        var cx = center.x;
        var cy = center.y;
        var ref = this;
        var x = ref.x;
        var y = ref.y;

        this.x = round(
            cx + (x - cx) * cosT + (y - cy) * sinT,
            COORD_PRECISION
        );

        this.y = round(
            cy + (y - cy) * cosT - (x - cx) * sinT,
            COORD_PRECISION
        );

        return this;
    };

    Point.prototype.multiply = function multiply (a) {

        this.x *= a;
        this.y *= a;

        return this;
    };

    Point.prototype.distanceTo = function distanceTo (point) {
        var dx = this.x - point.x;
        var dy = this.y - point.y;

        return Math.sqrt(dx * dx + dy * dy);
    };

    Point.onCircle = function onCircle (center, angle, radius) {
        var radians = rad(angle);

        return new Point(
            center.x - radius * Math.cos(radians),
            center.y - radius * Math.sin(radians)
        );
    };

    return Point;
}(Class));


export default Point;