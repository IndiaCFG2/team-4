export default function equalsIgnoreCase(a, b) {
    if (a && b) {
        return a.toLowerCase() === b.toLowerCase();
    }

    return a === b;
}