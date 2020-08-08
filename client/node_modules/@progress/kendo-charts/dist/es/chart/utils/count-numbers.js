import { isNumber } from '../../common';

export default function countNumbers(values) {
    var length = values.length;
    var count = 0;

    for (var i = 0; i < length; i++) {
        var num = values[i];
        if (isNumber(num)) {
            count++;
        }
    }

    return count;
}