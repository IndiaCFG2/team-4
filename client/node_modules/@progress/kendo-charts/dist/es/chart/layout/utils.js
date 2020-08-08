export function forEach(elements, callback) {
    elements.forEach(callback);
}

export function forEachReverse(elements, callback) {
    var length = elements.length;

    for (var idx = length - 1; idx >= 0; idx--) {
        callback(elements[idx], idx - length - 1);
    }
}