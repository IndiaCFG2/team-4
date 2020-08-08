import { drawing } from '@progress/kendo-drawing';

export default function map(array, callback) {
    var length = array.length;
    var result = [];
    for (var idx = 0; idx < length; idx++) {
        var value = callback(array[idx]);
        if (drawing.util.defined(value)) {
            result.push(value);
        }
    }
    return result;
}