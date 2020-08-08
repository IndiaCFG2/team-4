import LogarithmicAxis from './logarithmic-axis';
import RadarNumericAxisMixin from './mixins/radar-numeric-axis-mixin';

import { deepExtend } from '../common';

class RadarLogarithmicAxis extends LogarithmicAxis {
    radarMajorGridLinePositions() {
        const positions = [];

        this.traverseMajorTicksPositions(function(position) {
            positions.push(position);
        }, this.options.majorGridLines);

        return positions;
    }

    radarMinorGridLinePositions() {
        const positions = [];

        this.traverseMinorTicksPositions(function(position) {
            positions.push(position);
        }, this.options.minorGridLines);

        return positions;
    }

    axisType() {
        return LogarithmicAxis;
    }
}

deepExtend(RadarLogarithmicAxis.prototype, RadarNumericAxisMixin);

export default RadarLogarithmicAxis;