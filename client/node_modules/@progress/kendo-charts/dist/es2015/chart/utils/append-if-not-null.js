export default function appendIfNotNull(array, element) {
    if (element !== null) {
        array.push(element);
    }
}