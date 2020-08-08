import { geometry as geom } from '@progress/kendo-drawing';

import { X, Y } from '../common/constants';
import { Class, last, round } from '../common';

const WEIGHT = 0.333;
const EXTREMUM_ALLOWED_DEVIATION = 0.01;

class CurveProcessor extends Class {

    constructor(closed) {
        super();

        this.closed = closed;
    }

    process(dataPoints) {
        const points = dataPoints.slice(0);
        const segments = [];
        let closed = this.closed;
        let length = points.length;

        if (length > 2) {
            this.removeDuplicates(0, points);
            length = points.length;
        }

        if (length < 2 || (length === 2 && points[0].equals(points[1]))) {
            return segments;
        }

        let p0 = points[0];
        let p1 = points[1];
        let p2 = points[2];

        segments.push(new geom.Segment(p0));

        while (p0.equals(points[length - 1])) {
            closed = true;
            points.pop();
            length--;
        }

        if (length === 2) {
            const tangent = this.tangent(p0,p1, X, Y);

            last(segments).controlOut(
                this.firstControlPoint(tangent, p0, p1, X, Y)
            );

            segments.push(new geom.Segment(
                p1,
                this.secondControlPoint(tangent, p0, p1, X, Y)
            ));

            return segments;
        }

        let initialControlPoint, lastControlPoint;

        if (closed) {
            p0 = points[length - 1]; p1 = points[0]; p2 = points[1];
            const controlPoints = this.controlPoints(p0, p1, p2);
            initialControlPoint = controlPoints[1];
            lastControlPoint = controlPoints[0];
        } else {
            const tangent = this.tangent(p0, p1, X,Y);
            initialControlPoint = this.firstControlPoint(tangent, p0, p1, X, Y);
        }

        let cp0 = initialControlPoint;
        for (let idx = 0; idx <= length - 3; idx++) {
            this.removeDuplicates(idx, points);
            length = points.length;
            if (idx + 3 <= length) {
                p0 = points[idx]; p1 = points[idx + 1]; p2 = points[idx + 2];
                const controlPoints = this.controlPoints(p0,p1,p2);

                last(segments).controlOut(cp0);
                cp0 = controlPoints[1];

                const cp1 = controlPoints[0];
                segments.push(new geom.Segment(p1, cp1));
            }
        }

        if (closed) {
            p0 = points[length - 2]; p1 = points[length - 1]; p2 = points[0];
            const controlPoints = this.controlPoints(p0, p1, p2);

            last(segments).controlOut(cp0);
            segments.push(new geom.Segment(
                p1,
                controlPoints[0]
            ));

            last(segments).controlOut(controlPoints[1]);
            segments.push(new geom.Segment(
                p2,
                lastControlPoint
            ));
        } else {
            const tangent = this.tangent(p1, p2, X, Y);

            last(segments).controlOut(cp0);
            segments.push(new geom.Segment(
                p2,
                this.secondControlPoint(tangent, p1, p2, X, Y)
            ));
        }

        return segments;
    }

    removeDuplicates(idx, points) {
        while (points[idx + 1] && (points[idx].equals(points[idx + 1]) || points[idx + 1].equals(points[idx + 2]))) {
            points.splice(idx + 1, 1);
        }
    }

    invertAxis(p0, p1, p2) {
        let invertAxis = false;

        if (p0.x === p1.x) {
            invertAxis = true;
        } else if (p1.x === p2.x) {
            if ((p1.y < p2.y && p0.y <= p1.y) || (p2.y < p1.y && p1.y <= p0.y)) {
                invertAxis = true;
            }
        } else {
            const fn = this.lineFunction(p0,p1);
            const y2 = this.calculateFunction(fn, p2.x);
            if (!(p0.y <= p1.y && p2.y <= y2) &&
                !(p1.y <= p0.y && p2.y >= y2)) {
                invertAxis = true;
            }
        }

        return invertAxis;
    }

    isLine(p0, p1, p2) {
        const fn = this.lineFunction(p0, p1);
        const y2 = this.calculateFunction(fn, p2.x);

        return (p0.x === p1.x && p1.x === p2.x) || round(y2, 1) === round(p2.y, 1);
    }

    lineFunction(p1, p2) {
        const a = (p2.y - p1.y) / (p2.x - p1.x);
        const b = p1.y - a * p1.x;

        return [ b, a ];
    }

    controlPoints(p0, p1, p2) {
        let xField = X;
        let yField = Y;
        let restrict = false;
        let switchOrientation = false;
        let tangent;

        if (this.isLine(p0, p1, p2)) {
            tangent = this.tangent(p0, p1, X, Y);
        } else {
            const monotonic = {
                x: this.isMonotonicByField(p0, p1, p2, X),
                y: this.isMonotonicByField(p0, p1, p2, Y)
            };

            if (monotonic.x && monotonic.y) {
                tangent = this.tangent(p0, p2, X, Y);
                restrict = true;
            } else {
                if (this.invertAxis(p0, p1, p2)) {
                    xField = Y;
                    yField = X;
                }

                if (monotonic[xField]) {
                    tangent = 0;
                } else {
                    let sign;
                    if ((p2[yField] < p0[yField] && p0[yField] <= p1[yField]) ||
                        (p0[yField] < p2[yField] && p1[yField] <= p0[yField])) {
                        sign = numberSign((p2[yField] - p0[yField]) * (p1[xField] - p0[xField]));
                    } else {
                        sign = -numberSign((p2[xField] - p0[xField]) * (p1[yField] - p0[yField]));
                    }

                    tangent = EXTREMUM_ALLOWED_DEVIATION * sign;
                    switchOrientation = true;
                }
            }
        }

        const secondControlPoint = this.secondControlPoint(tangent, p0, p1, xField, yField);

        if (switchOrientation) {
            const oldXField = xField;
            xField = yField;
            yField = oldXField;
        }

        const firstControlPoint = this.firstControlPoint(tangent, p1, p2, xField, yField);

        if (restrict) {
            this.restrictControlPoint(p0, p1, secondControlPoint, tangent);
            this.restrictControlPoint(p1, p2, firstControlPoint, tangent);
        }

        return [ secondControlPoint, firstControlPoint ];
    }

    restrictControlPoint(p1, p2, cp, tangent) {
        if (p1.y < p2.y) {
            if (p2.y < cp.y) {
                cp.x = p1.x + (p2.y - p1.y) / tangent;
                cp.y = p2.y;
            } else if (cp.y < p1.y) {
                cp.x = p2.x - (p2.y - p1.y) / tangent;
                cp.y = p1.y;
            }
        } else {
            if (cp.y < p2.y) {
                cp.x = p1.x - (p1.y - p2.y) / tangent;
                cp.y = p2.y;
            } else if (p1.y < cp.y) {
                cp.x = p2.x + (p1.y - p2.y) / tangent;
                cp.y = p1.y;
            }
        }
    }

    tangent(p0, p1, xField, yField) {
        const x = p1[xField] - p0[xField];
        const y = p1[yField] - p0[yField];
        let tangent;

        if (x === 0) {
            tangent = 0;
        } else {
            tangent = y / x;
        }

        return tangent;
    }

    isMonotonicByField(p0, p1, p2, field) {
        return (p2[field] > p1[field] && p1[field] > p0[field]) ||
                    (p2[field] < p1[field] && p1[field] < p0[field]);
    }

    firstControlPoint(tangent, p0, p3, xField, yField) {
        const t1 = p0[xField];
        const t2 = p3[xField];
        const distance = (t2 - t1) * WEIGHT;

        return this.point(t1 + distance, p0[yField] + distance * tangent, xField, yField);
    }

    secondControlPoint(tangent, p0, p3, xField, yField) {
        const t1 = p0[xField];
        const t2 = p3[xField];
        const distance = (t2 - t1) * WEIGHT;

        return this.point(t2 - distance, p3[yField] - distance * tangent, xField, yField);
    }

    point(xValue, yValue, xField, yField) {
        const controlPoint = new geom.Point();
        controlPoint[xField] = xValue;
        controlPoint[yField] = yValue;

        return controlPoint;
    }

    calculateFunction(fn, x) {
        const length = fn.length;
        let result = 0;

        for (let i = 0; i < length; i++) {
            result += Math.pow(x,i) * fn[i];
        }
        return result;
    }
}

function numberSign(value) {
    return value <= 0 ? -1 : 1;
}

export default CurveProcessor;