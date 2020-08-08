import Ring from './ring';

var Sector = (function (Ring) {
    function Sector(center, radius, startAngle, angle) {
        Ring.call(this, center, 0, radius, startAngle, angle);
    }

    if ( Ring ) Sector.__proto__ = Ring;
    Sector.prototype = Object.create( Ring && Ring.prototype );
    Sector.prototype.constructor = Sector;

    Sector.prototype.expand = function expand (value) {
        return Ring.prototype.expand.call(this, value);
    };

    Sector.prototype.clone = function clone () {
        return new Sector(this.center, this.radius, this.startAngle, this.angle);
    };

    Sector.prototype.setRadius = function setRadius (newRadius) {
        this.radius = newRadius;

        return this;
    };

    return Sector;
}(Ring));

export default Sector;