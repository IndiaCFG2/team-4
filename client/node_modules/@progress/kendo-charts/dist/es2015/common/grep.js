export default function grep(array, callback) {
    const length = array.length;
    const result = [];
    for (let idx = 0; idx < length; idx++) {
        if (callback(array[idx])) {
            result .push(array[idx]);
        }
    }

    return result;
}