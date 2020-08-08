import Point from '../point';

export default function lineIntersection(p0, p1, p2, p3) {
    const s1x = p1.x - p0.x;
    const s2x = p3.x - p2.x;
    const s1y = p1.y - p0.y;
    const s2y = p3.y - p2.y;
    const nx = p0.x - p2.x;
    const ny = p0.y - p2.y;
    const d = s1x * s2y - s2x * s1y;
    const s = (s1x * ny - s1y * nx) / d;
    const t = (s2x * ny - s2y * nx) / d;

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        return new Point(p0.x + t * s1x, p0.y + t * s1y);
    }
}