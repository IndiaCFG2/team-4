import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';
import { Class } from '../common';

var DIRECTION_ANGLE = 0.001; //any value that will make the endAngle bigger than the start angle will work here.

var ShapeBuilder = (function (Class) {
    function ShapeBuilder () {
        Class.apply(this, arguments);
    }

    if ( Class ) ShapeBuilder.__proto__ = Class;
    ShapeBuilder.prototype = Object.create( Class && Class.prototype );
    ShapeBuilder.prototype.constructor = ShapeBuilder;

    ShapeBuilder.prototype.createRing = function createRing (sector, options) {
        var startAngle = sector.startAngle + 180;
        var endAngle = sector.angle + startAngle;

        //required in order to avoid reversing the arc direction in cases like 0.000000000000001 + 100 === 100
        if (sector.angle > 0 && startAngle === endAngle) {
            endAngle += DIRECTION_ANGLE;
        }

        var center = new geom.Point(sector.center.x, sector.center.y);
        var radius = Math.max(sector.radius, 0);
        var innerRadius = Math.max(sector.innerRadius, 0);
        var arc = new geom.Arc(center, {
            startAngle: startAngle,
            endAngle: endAngle,
            radiusX: radius,
            radiusY: radius
        });
        var path = draw.Path.fromArc(arc, options).close();

        if (innerRadius) {
            arc.radiusX = arc.radiusY = innerRadius;
            var innerEnd = arc.pointAt(endAngle);
            path.lineTo(innerEnd.x, innerEnd.y);
            path.arc(endAngle, startAngle, innerRadius, innerRadius, true);
        } else {
            path.lineTo(center.x, center.y);
        }

        return path;
    };

    return ShapeBuilder;
}(Class));

ShapeBuilder.current = new ShapeBuilder();

export default ShapeBuilder;