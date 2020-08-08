import { MIN_VALUE, MAX_VALUE } from './constants';

export default function sparseArrayLimits(arr) {
    var min = MAX_VALUE;
    var max = MIN_VALUE;

    for (var idx = 0, length = arr.length; idx < length; idx++) {
        var value = arr[idx];
        if (value !== null && isFinite(value)) {
            min = Math.min(min, value);
            max = Math.max(max, value);
        }
    }

    return {
        min: min === MAX_VALUE ? undefined : min,
        max: max === MIN_VALUE ? undefined : max
    };
}