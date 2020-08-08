export default function singleItemOrArray(array) {
    return array.length === 1 ? array[0] : array;
}