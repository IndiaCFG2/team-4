import { drawing } from '@progress/kendo-drawing';

export default function map(array, callback) {
    const length = array.length;
    const result = [];
    for (let idx = 0; idx < length; idx++) {
        let value = callback(array[idx]);
        if (drawing.util.defined(value)) {
            result.push(value);
        }
    }
    return result;
}