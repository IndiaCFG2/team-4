import LinePoint from '../line-chart/line-point';

var RangeLinePoint = (function (LinePoint) {
    function RangeLinePoint () {
        LinePoint.apply(this, arguments);
    }

    if ( LinePoint ) RangeLinePoint.__proto__ = LinePoint;
    RangeLinePoint.prototype = Object.create( LinePoint && LinePoint.prototype );
    RangeLinePoint.prototype.constructor = RangeLinePoint;

    RangeLinePoint.prototype.aliasFor = function aliasFor () {
        return this.parent;
    };

    return RangeLinePoint;
}(LinePoint));

export default RangeLinePoint;