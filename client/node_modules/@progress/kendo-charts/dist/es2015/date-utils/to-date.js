export default function toDate(value) {
    let result;

    if (value instanceof Date) {
        result = value;
    } else if (value) {
        result = new Date(value);
    }

    return result;
}