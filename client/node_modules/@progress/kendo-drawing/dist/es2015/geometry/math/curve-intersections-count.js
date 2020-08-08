import toCubicPolynomial from './to-cubic-polynomial';
import solveCubicEquation from './solve-cubic-equation';
import calculateCurveAt from './calculate-curve-at';
import close from './close';

export default function curveIntersectionsCount(points, point, bbox) {
    const polynomial = toCubicPolynomial(points, "x");
    const roots = solveCubicEquation(polynomial[0], polynomial[1], polynomial[2], polynomial[3] - point.x);
    let rayIntersection, intersectsRay;
    let count = 0;
    for (let i = 0; i < roots.length; i++) {
        rayIntersection = calculateCurveAt(roots[i], "y", points);
        intersectsRay = close(rayIntersection, point.y) || rayIntersection > point.y;
        if (intersectsRay && (((roots[i] === 0 || roots[i] === 1) && bbox.bottomRight().x > point.x) || (0 < roots[i] && roots[i] < 1))) {
            count++;
        }
    }

    return count;
}