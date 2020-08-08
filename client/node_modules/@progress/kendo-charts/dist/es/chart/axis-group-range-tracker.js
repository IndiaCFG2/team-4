import { MIN_VALUE, MAX_VALUE } from '../common/constants';
import { Class } from '../common';

var AxisGroupRangeTracker = (function (Class) {
    function AxisGroupRangeTracker() {
        Class.call(this);

        this.axisRanges = {};
    }

    if ( Class ) AxisGroupRangeTracker.__proto__ = Class;
    AxisGroupRangeTracker.prototype = Object.create( Class && Class.prototype );
    AxisGroupRangeTracker.prototype.constructor = AxisGroupRangeTracker;

    AxisGroupRangeTracker.prototype.update = function update (chartAxisRanges) {
        var axisRanges = this.axisRanges;

        for (var axisName in chartAxisRanges) {
            var chartRange = chartAxisRanges[axisName];
            var range = axisRanges[axisName];
            axisRanges[axisName] = range = range || { min: MAX_VALUE, max: MIN_VALUE };

            range.min = Math.min(range.min, chartRange.min);
            range.max = Math.max(range.max, chartRange.max);
        }
    };

    AxisGroupRangeTracker.prototype.reset = function reset (axisName) {
        this.axisRanges[axisName] = undefined;
    };

    AxisGroupRangeTracker.prototype.query = function query (axisName) {
        return this.axisRanges[axisName];
    };

    return AxisGroupRangeTracker;
}(Class));

export default AxisGroupRangeTracker;