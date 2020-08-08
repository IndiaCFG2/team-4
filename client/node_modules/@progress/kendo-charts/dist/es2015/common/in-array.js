export default function inArray(value, array) {
    if (array) {
        return array.indexOf(value) !== -1;
    }
}