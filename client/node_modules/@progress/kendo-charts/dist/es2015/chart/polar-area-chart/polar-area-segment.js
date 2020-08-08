import { geometry as geom } from '@progress/kendo-drawing';
import AreaSegment from '../area-chart/area-segment';

class PolarAreaSegment extends AreaSegment {
    fillToAxes(fillPath) {
        const polarAxis = this.parent.plotArea.polarAxis;
        const center = polarAxis.box.center();
        const centerSegment = new geom.Segment([ center.x, center.y ]);

        fillPath.segments.unshift(centerSegment);
        fillPath.segments.push(centerSegment);
    }
}

export default PolarAreaSegment;