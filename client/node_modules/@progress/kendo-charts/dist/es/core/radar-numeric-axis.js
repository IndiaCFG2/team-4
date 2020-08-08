import NumericAxis from './numeric-axis';
import RadarNumericAxisMixin from './mixins/radar-numeric-axis-mixin';

import { deepExtend } from '../common';

var RadarNumericAxis = (function (NumericAxis) {
    function RadarNumericAxis () {
        NumericAxis.apply(this, arguments);
    }

    if ( NumericAxis ) RadarNumericAxis.__proto__ = NumericAxis;
    RadarNumericAxis.prototype = Object.create( NumericAxis && NumericAxis.prototype );
    RadarNumericAxis.prototype.constructor = RadarNumericAxis;

    RadarNumericAxis.prototype.radarMajorGridLinePositions = function radarMajorGridLinePositions () {
        return this.getTickPositions(this.options.majorUnit);
    };

    RadarNumericAxis.prototype.radarMinorGridLinePositions = function radarMinorGridLinePositions () {
        var options = this.options;
        var minorSkipStep = 0;

        if (options.majorGridLines.visible) {
            minorSkipStep = options.majorUnit;
        }
        return this.getTickPositions(options.minorUnit, minorSkipStep);
    };

    RadarNumericAxis.prototype.axisType = function axisType () {
        return NumericAxis;
    };

    return RadarNumericAxis;
}(NumericAxis));

deepExtend(RadarNumericAxis.prototype, RadarNumericAxisMixin);

export default RadarNumericAxis;