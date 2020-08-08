import { MIN_VALUE, MAX_VALUE } from '../common/constants';
import { Class } from '../common';

class AxisGroupRangeTracker extends Class {
    constructor() {
        super();

        this.axisRanges = {};
    }

    update(chartAxisRanges) {
        const axisRanges = this.axisRanges;

        for (let axisName in chartAxisRanges) {
            const chartRange = chartAxisRanges[axisName];
            let range = axisRanges[axisName];
            axisRanges[axisName] = range = range || { min: MAX_VALUE, max: MIN_VALUE };

            range.min = Math.min(range.min, chartRange.min);
            range.max = Math.max(range.max, chartRange.max);
        }
    }

    reset(axisName) {
        this.axisRanges[axisName] = undefined;
    }

    query(axisName) {
        return this.axisRanges[axisName];
    }
}

export default AxisGroupRangeTracker;