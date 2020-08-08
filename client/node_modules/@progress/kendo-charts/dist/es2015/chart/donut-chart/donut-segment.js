import PieSegment from '../pie-chart/pie-segment';
import PointEventsMixin from '../mixins/point-events-mixin';

import { PIE } from '../constants';

import { ShapeBuilder, Box } from '../../core';

import { CENTER } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

class DonutSegment extends PieSegment {
    reflowLabel() {
        const { options: { labels: labelsOptions }, label } = this;
        const sector = this.sector.clone();
        const angle = sector.middle();

        if (label) {
            const labelHeight = label.box.height();
            if (labelsOptions.position === CENTER) {
                sector.radius -= (sector.radius - sector.innerRadius) / 2;

                const lp = sector.point(angle);

                label.reflow(new Box(lp.x, lp.y - labelHeight / 2, lp.x, lp.y));
            } else {
                super.reflowLabel();
            }
        }
    }

    createSegment(sector, options) {
        return ShapeBuilder.current.createRing(sector, options);
    }
}

setDefaultOptions(DonutSegment, {
    overlay: {
        gradient: "roundedGlass"
    },
    labels: {
        position: CENTER
    },
    animation: {
        type: PIE
    }
});

deepExtend(DonutSegment.prototype, PointEventsMixin);


export default DonutSegment;
