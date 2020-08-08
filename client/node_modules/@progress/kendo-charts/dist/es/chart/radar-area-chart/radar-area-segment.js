import AreaSegment from '../area-chart/area-segment';

var RadarAreaSegment = (function (AreaSegment) {
    function RadarAreaSegment () {
        AreaSegment.apply(this, arguments);
    }

    if ( AreaSegment ) RadarAreaSegment.__proto__ = AreaSegment;
    RadarAreaSegment.prototype = Object.create( AreaSegment && AreaSegment.prototype );
    RadarAreaSegment.prototype.constructor = RadarAreaSegment;

    RadarAreaSegment.prototype.fillToAxes = function fillToAxes () {};

    return RadarAreaSegment;
}(AreaSegment));

export default RadarAreaSegment;