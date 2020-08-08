export default function grep(array, callback) {
    var length = array.length;
    var result = [];
    for (var idx = 0; idx < length; idx++) {
        if (callback(array[idx])) {
            result .push(array[idx]);
        }
    }

    return result;
}