import toCubicPolynomial from './to-cubic-polynomial';
import solveCubicEquation from './solve-cubic-equation';
import calculateCurveAt from './calculate-curve-at';

export default function hasRootsInRange(points, point, field, rootField, range) {
    const polynomial = toCubicPolynomial(points, rootField);
    const roots = solveCubicEquation(polynomial[0], polynomial[1], polynomial[2], polynomial[3] - point[rootField]);
    let intersection;

    for (let idx = 0; idx < roots.length; idx++) {
        if (0 <= roots[idx] && roots[idx] <= 1) {
            intersection = calculateCurveAt(roots[idx], field, points);
            if (Math.abs(intersection - point[field]) <= range) {
                return true;
            }
        }
    }
}