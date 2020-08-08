import { MIN_VALUE, MAX_VALUE } from './constants';

export default function sparseArrayLimits(arr) {
    let min = MAX_VALUE;
    let max = MIN_VALUE;

    for (let idx = 0, length = arr.length; idx < length; idx++) {
        const value = arr[idx];
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