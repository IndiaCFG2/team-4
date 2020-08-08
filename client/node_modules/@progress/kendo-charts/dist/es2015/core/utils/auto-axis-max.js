import { ZERO_THRESHOLD } from '../constants';

export default function autoAxisMax(min, max, narrow) {
    if (!min && !max) {
        return 1;
    }

    let axisMax;

    if (min <= 0 && max <= 0) {
        const maxValue = min === max ? 0 : max;

        let diff = Math.abs((maxValue - min) / maxValue);
        if (narrow === false || (!narrow && diff > ZERO_THRESHOLD)) {
            return 0;
        }

        axisMax = Math.min(0, maxValue - ((min - maxValue) / 2));
    } else {
        axisMax = max;
    }

    return axisMax;
}