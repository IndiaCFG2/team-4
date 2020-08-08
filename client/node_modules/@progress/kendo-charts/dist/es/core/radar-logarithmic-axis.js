import LogarithmicAxis from './logarithmic-axis';
import RadarNumericAxisMixin from './mixins/radar-numeric-axis-mixin';

import { deepExtend } from '../common';

var RadarLogarithmicAxis = (function (LogarithmicAxis) {
    function RadarLogarithmicAxis () {
        LogarithmicAxis.apply(this, arguments);
    }

    if ( LogarithmicAxis ) RadarLogarithmicAxis.__proto__ = LogarithmicAxis;
    RadarLogarithmicAxis.prototype = Object.create( LogarithmicAxis && LogarithmicAxis.prototype );
    RadarLogarithmicAxis.prototype.constructor = RadarLogarithmicAxis;

    RadarLogarithmicAxis.prototype.radarMajorGridLinePositions = function radarMajorGridLinePositions () {
        var positions = [];

        this.traverseMajorTicksPositions(function(position) {
            positions.push(position);
        }, this.options.majorGridLines);

        return positions;
    };

    RadarLogarithmicAxis.prototype.radarMinorGridLinePositions = function radarMinorGridLinePositions () {
        var positions = [];

        this.traverseMinorTicksPositions(function(position) {
            positions.push(position);
        }, this.options.minorGridLines);

        return positions;
    };

    RadarLogarithmicAxis.prototype.axisType = function axisType () {
        return LogarithmicAxis;
    };

    return RadarLogarithmicAxis;
}(LogarithmicAxis));

deepExtend(RadarLogarithmicAxis.prototype, RadarNumericAxisMixin);

export default RadarLogarithmicAxis;