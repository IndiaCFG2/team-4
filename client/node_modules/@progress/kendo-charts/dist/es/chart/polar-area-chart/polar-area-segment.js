import { geometry as geom } from '@progress/kendo-drawing';
import AreaSegment from '../area-chart/area-segment';

var PolarAreaSegment = (function (AreaSegment) {
    function PolarAreaSegment () {
        AreaSegment.apply(this, arguments);
    }

    if ( AreaSegment ) PolarAreaSegment.__proto__ = AreaSegment;
    PolarAreaSegment.prototype = Object.create( AreaSegment && AreaSegment.prototype );
    PolarAreaSegment.prototype.constructor = PolarAreaSegment;

    PolarAreaSegment.prototype.fillToAxes = function fillToAxes (fillPath) {
        var polarAxis = this.parent.plotArea.polarAxis;
        var center = polarAxis.box.center();
        var centerSegment = new geom.Segment([ center.x, center.y ]);

        fillPath.segments.unshift(centerSegment);
        fillPath.segments.push(centerSegment);
    };

    return PolarAreaSegment;
}(AreaSegment));

export default PolarAreaSegment;