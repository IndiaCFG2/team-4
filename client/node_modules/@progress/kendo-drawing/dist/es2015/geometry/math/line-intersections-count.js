export default function lineIntersectionsCount(a, b, point) {
    let intersects;
    if (a.x !== b.x) {
        const minX = Math.min(a.x, b.x);
        const maxX = Math.max(a.x, b.x);
        const minY = Math.min(a.y, b.y);
        const maxY = Math.max(a.y, b.y);
        const inRange = minX <= point.x && point.x < maxX;

        if (minY === maxY) {
            intersects = point.y <= minY && inRange;
        } else {
            intersects = inRange && (((maxY - minY) * ((a.x - b.x) * (a.y - b.y) > 0 ? point.x - minX : maxX - point.x)) / (maxX - minX) + minY - point.y) >= 0;
        }
    }

    return intersects ? 1 : 0;
}