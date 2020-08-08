import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';
import { Class } from '../common';

const DIRECTION_ANGLE = 0.001; //any value that will make the endAngle bigger than the start angle will work here.

class ShapeBuilder extends Class {
    createRing(sector, options) {
        const startAngle = sector.startAngle + 180;
        let endAngle = sector.angle + startAngle;

        //required in order to avoid reversing the arc direction in cases like 0.000000000000001 + 100 === 100
        if (sector.angle > 0 && startAngle === endAngle) {
            endAngle += DIRECTION_ANGLE;
        }

        const center = new geom.Point(sector.center.x, sector.center.y);
        const radius = Math.max(sector.radius, 0);
        const innerRadius = Math.max(sector.innerRadius, 0);
        const arc = new geom.Arc(center, {
            startAngle: startAngle,
            endAngle: endAngle,
            radiusX: radius,
            radiusY: radius
        });
        const path = draw.Path.fromArc(arc, options).close();

        if (innerRadius) {
            arc.radiusX = arc.radiusY = innerRadius;
            const innerEnd = arc.pointAt(endAngle);
            path.lineTo(innerEnd.x, innerEnd.y);
            path.arc(endAngle, startAngle, innerRadius, innerRadius, true);
        } else {
            path.lineTo(center.x, center.y);
        }

        return path;
    }
}

ShapeBuilder.current = new ShapeBuilder();

export default ShapeBuilder;