import PieSegment from '../pie-chart/pie-segment';
import PointEventsMixin from '../mixins/point-events-mixin';

import { PIE } from '../constants';

import { ShapeBuilder, Box } from '../../core';

import { CENTER } from '../../common/constants';
import { deepExtend, setDefaultOptions } from '../../common';

var DonutSegment = (function (PieSegment) {
    function DonutSegment () {
        PieSegment.apply(this, arguments);
    }

    if ( PieSegment ) DonutSegment.__proto__ = PieSegment;
    DonutSegment.prototype = Object.create( PieSegment && PieSegment.prototype );
    DonutSegment.prototype.constructor = DonutSegment;

    DonutSegment.prototype.reflowLabel = function reflowLabel () {
        var ref = this;
        var labelsOptions = ref.options.labels;
        var label = ref.label;
        var sector = this.sector.clone();
        var angle = sector.middle();

        if (label) {
            var labelHeight = label.box.height();
            if (labelsOptions.position === CENTER) {
                sector.radius -= (sector.radius - sector.innerRadius) / 2;

                var lp = sector.point(angle);

                label.reflow(new Box(lp.x, lp.y - labelHeight / 2, lp.x, lp.y));
            } else {
                PieSegment.prototype.reflowLabel.call(this);
            }
        }
    };

    DonutSegment.prototype.createSegment = function createSegment (sector, options) {
        return ShapeBuilder.current.createRing(sector, options);
    };

    return DonutSegment;
}(PieSegment));

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
