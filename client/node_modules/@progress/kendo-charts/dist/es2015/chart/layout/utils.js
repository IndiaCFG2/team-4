export function forEach(elements, callback) {
    elements.forEach(callback);
}

export function forEachReverse(elements, callback) {
    const length = elements.length;

    for (let idx = length - 1; idx >= 0; idx--) {
        callback(elements[idx], idx - length - 1);
    }
}