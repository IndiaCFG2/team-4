export default function toDate(value) {
    var result;

    if (value instanceof Date) {
        result = value;
    } else if (value) {
        result = new Date(value);
    }

    return result;
}