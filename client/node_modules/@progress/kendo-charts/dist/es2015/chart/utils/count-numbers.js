import { isNumber } from '../../common';

export default function countNumbers(values) {
    const length = values.length;
    let count = 0;

    for (let i = 0; i < length; i++) {
        const num = values[i];
        if (isNumber(num)) {
            count++;
        }
    }

    return count;
}