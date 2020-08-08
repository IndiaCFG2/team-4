import { ZERO_THRESHOLD } from '../constants';

export default function autoAxisMin(min, max, narrow) {
    if (!min && !max) {
        return 0;
    }

    var axisMin;

    if (min >= 0 && max >= 0) {
        var minValue = min === max ? 0 : min;

        var diff = (max - minValue) / max;
        if (narrow === false || (!narrow && diff > ZERO_THRESHOLD)) {
            return 0;
        }

        axisMin = Math.max(0, minValue - ((max - minValue) / 2));
    } else {
        axisMin = min;
    }

    return axisMin;
}
