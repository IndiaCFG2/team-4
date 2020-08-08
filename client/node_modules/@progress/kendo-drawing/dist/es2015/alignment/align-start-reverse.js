
export default function alignStartReverse(size, rect, align, axis, sizeField) {
    let start;
    if (align === "start") {
        start = rect.origin[axis] + rect.size[sizeField] - size;
    } else if (align === "end") {
        start = rect.origin[axis];
    } else {
        start = rect.origin[axis] + (rect.size[sizeField] - size) / 2;
    }

    return start;
}