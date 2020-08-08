import NumericAxis from './numeric-axis';
import RadarNumericAxisMixin from './mixins/radar-numeric-axis-mixin';

import { deepExtend } from '../common';

class RadarNumericAxis extends NumericAxis {
    radarMajorGridLinePositions() {
        return this.getTickPositions(this.options.majorUnit);
    }

    radarMinorGridLinePositions() {
        const options = this.options;
        let minorSkipStep = 0;

        if (options.majorGridLines.visible) {
            minorSkipStep = options.majorUnit;
        }
        return this.getTickPositions(options.minorUnit, minorSkipStep);
    }

    axisType() {
        return NumericAxis;
    }
}

deepExtend(RadarNumericAxis.prototype, RadarNumericAxisMixin);

export default RadarNumericAxis;