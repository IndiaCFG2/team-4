export default function find(array, predicate) {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (predicate(item, i, array)) {
            return item;
        }
    }
}
