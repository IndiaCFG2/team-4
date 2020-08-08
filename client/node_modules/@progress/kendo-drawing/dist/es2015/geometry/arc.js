import defineAccessors from '../accessors/define-accessors';
import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import { deg, rad, round } from '../util';

import closeOrLess from './math/close-or-less';
import lineIntersection from './math/line-intersection';
import ellipseExtremeAngles from './math/ellipse-extreme-angles';

import { PRECISION } from './constants';
import Point from './point';
import Rect from './rect';
import transform from './transform';

const MAX_INTERVAL = 45;
const pow = Math.pow;

class Arc extends Class {

    constructor(center = new Point(), options = {}) {
        super();

        this.setCenter(center);

        this.radiusX = options.radiusX;
        this.radiusY = options.radiusY || options.radiusX;
        this.startAngle = options.startAngle;
        this.endAngle = options.endAngle;
        this.anticlockwise = options.anticlockwise || false;
        this.xRotation = options.xRotation;
    }

    clone() {
        return new Arc(this.center, {
            radiusX: this.radiusX,
            radiusY: this.radiusY,
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            anticlockwise: this.anticlockwise
        });
    }

    setCenter(value) {
        this._observerField("center", Point.create(value));
        this.geometryChange();
        return this;
    }

    getCenter() {
        return this.center;
    }

    pointAt(angle) {
        const center = this.center;
        const radian = rad(angle);

        return new Point(
            center.x + this.radiusX * Math.cos(radian),
            center.y + this.radiusY * Math.sin(radian)
        );
    }

    curvePoints() {
        const startAngle = this.startAngle;
        const dir = this.anticlockwise ? -1 : 1;
        const curvePoints = [ this.pointAt(startAngle) ];
        const interval = this._arcInterval();
        const intervalAngle = interval.endAngle - interval.startAngle;
        const subIntervalsCount = Math.ceil(intervalAngle / MAX_INTERVAL);
        const subIntervalAngle = intervalAngle / subIntervalsCount;
        let currentAngle = startAngle;
        let transformation;
        if (this.xRotation) {
            transformation = transform().rotate(this.xRotation, this.center);
        }

        for (let i = 1; i <= subIntervalsCount; i++) {
            const nextAngle = currentAngle + dir * subIntervalAngle;
            const points = this._intervalCurvePoints(currentAngle, nextAngle, transformation);

            curvePoints.push(points.cp1, points.cp2, points.p2);
            currentAngle = nextAngle;
        }

        return curvePoints;
    }

    bbox(matrix) {
        const interval = this._arcInterval();
        const startAngle = interval.startAngle;
        const endAngle = interval.endAngle;
        const extremeAngles = ellipseExtremeAngles(this.center, this.radiusX, this.radiusY, matrix);
        const extremeX = deg(extremeAngles.x);
        const extremeY = deg(extremeAngles.y);
        const endPoint = this.pointAt(endAngle).transformCopy(matrix);
        let currentAngleX = bboxStartAngle(extremeX, startAngle);
        let currentAngleY = bboxStartAngle(extremeY, startAngle);
        let currentPoint = this.pointAt(startAngle).transformCopy(matrix);
        let minPoint = Point.min(currentPoint, endPoint);
        let maxPoint = Point.max(currentPoint, endPoint);

        while (currentAngleX < endAngle || currentAngleY < endAngle) {
            let currentPointX;
            if (currentAngleX < endAngle) {
                currentPointX = this.pointAt(currentAngleX).transformCopy(matrix);
                currentAngleX += 90;
            }

            let currentPointY;
            if (currentAngleY < endAngle) {
                currentPointY = this.pointAt(currentAngleY).transformCopy(matrix);
                currentAngleY += 90;
            }

            currentPoint = new Point(currentPointX.x, currentPointY.y);
            minPoint = Point.min(minPoint, currentPoint);
            maxPoint = Point.max(maxPoint, currentPoint);
        }

        return Rect.fromPoints(minPoint, maxPoint);
    }

    _arcInterval() {
        let { startAngle, endAngle, anticlockwise } = this;

        if (anticlockwise) {
            let oldStart = startAngle;
            startAngle = endAngle;
            endAngle = oldStart;
        }

        if (startAngle > endAngle || (anticlockwise && startAngle === endAngle)) {
            endAngle += 360;
        }

        return {
            startAngle: startAngle,
            endAngle: endAngle
        };
    }

    _intervalCurvePoints(startAngle, endAngle, transformation) {
        const p1 = this.pointAt(startAngle);
        const p2 = this.pointAt(endAngle);
        const p1Derivative = this._derivativeAt(startAngle);
        const p2Derivative = this._derivativeAt(endAngle);
        const t = (rad(endAngle) - rad(startAngle)) / 3;
        const cp1 = new Point(p1.x + t * p1Derivative.x, p1.y + t * p1Derivative.y);
        const cp2 = new Point(p2.x - t * p2Derivative.x, p2.y - t * p2Derivative.y);
        if (transformation) {
            p1.transform(transformation);
            p2.transform(transformation);
            cp1.transform(transformation);
            cp2.transform(transformation);
        }

        return {
            p1: p1,
            cp1: cp1,
            cp2: cp2,
            p2: p2
        };
    }

    _derivativeAt(angle) {
        const radian = rad(angle);

        return new Point(-this.radiusX * Math.sin(radian), this.radiusY * Math.cos(radian));
    }

    containsPoint(point) {
        const interval = this._arcInterval();
        const intervalAngle = interval.endAngle - interval.startAngle;
        const { center, radiusX, radiusY } = this;
        const distance = center.distanceTo(point);
        const angleRad = Math.atan2(point.y - center.y, point.x - center.x);
        const pointRadius = (radiusX * radiusY) /
            Math.sqrt(pow(radiusX, 2) * pow(Math.sin(angleRad), 2) + pow(radiusY, 2) * pow(Math.cos(angleRad), 2));
        const startPoint = this.pointAt(this.startAngle).round(PRECISION);
        const endPoint = this.pointAt(this.endAngle).round(PRECISION);
        const intersection = lineIntersection(center, point.round(PRECISION), startPoint, endPoint);
        let containsPoint;

        if (intervalAngle < 180) {
            containsPoint = intersection && closeOrLess(center.distanceTo(intersection), distance) && closeOrLess(distance, pointRadius);
        } else {
            let angle = calculateAngle(center.x, center.y, radiusX, radiusY, point.x, point.y);
            if (angle !== 360) {
                angle = (360 + angle) % 360;
            }

            let inAngleRange = interval.startAngle <= angle && angle <= interval.endAngle;
            containsPoint = (inAngleRange && closeOrLess(distance, pointRadius)) || (!inAngleRange && (!intersection || intersection.equals(point)));
        }
        return containsPoint;
    }

    _isOnPath(point, width) {
        const interval = this._arcInterval();
        const center = this.center;
        let angle = calculateAngle(center.x, center.y, this.radiusX, this.radiusY, point.x, point.y);
        if (angle !== 360) {
            angle = (360 + angle) % 360;
        }

        const inAngleRange = interval.startAngle <= angle && angle <= interval.endAngle;

        return inAngleRange && this.pointAt(angle).distanceTo(point) <= width;
    }

    static fromPoints(start, end, rx, ry, largeArc, swipe, rotation) {// eslint-disable-line max-params
        const arcParameters = normalizeArcParameters({
            x1: start.x,
            y1: start.y,
            x2: end.x,
            y2: end.y,
            rx: rx,
            ry: ry,
            largeArc: largeArc,
            swipe: swipe,
            rotation: rotation
        });

        return new Arc(arcParameters.center, {
            startAngle: arcParameters.startAngle,
            endAngle: arcParameters.endAngle,
            radiusX: arcParameters.radiusX,
            radiusY: arcParameters.radiusY,
            xRotation: arcParameters.xRotation,
            anticlockwise: swipe === 0
        });
    }
}

defineAccessors(Arc.prototype, [ "radiusX", "radiusY", "startAngle", "endAngle", "anticlockwise" ]);
ObserversMixin.extend(Arc.prototype);

function calculateAngle(cx, cy, rx, ry, x, y) {
    const cos = round((x - cx) / rx, 3);
    const sin = round((y - cy) / ry, 3);

    return round(deg(Math.atan2(sin, cos)));
}

function normalizeArcParameters(parameters) {
    let { x1, y1, x2, y2, rx, ry, largeArc, swipe, rotation = 0 } = parameters;

    const radians = rad(rotation);
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    const xT = cosine * (x1 - x2) / 2 + sine * (y1 - y2) / 2;
    const yT = -sine * (x1 - x2) / 2 + cosine * (y1 - y2) / 2;

    const sign = largeArc !== swipe ? 1 : -1;

    const xt2 = Math.pow(xT, 2);
    const yt2 = Math.pow(yT, 2);
    let rx2 = Math.pow(rx, 2);
    let ry2 = Math.pow(ry, 2);

    let delta = xt2 / rx2 + yt2 / ry2;

    if (delta > 1) {
        delta = Math.sqrt(xt2 / rx2 + yt2 / ry2);
        rx = delta * rx;
        rx2 = Math.pow(rx, 2);

        ry = delta * ry;
        ry2 = Math.pow(ry, 2);
    }

    let constT = sign * Math.sqrt((rx2 * ry2 - rx2 * yt2 - ry2 * xt2) / (rx2 * yt2 + ry2 * xt2));
    // due to rounding errors the value could become NaN even after radii correction
    if (isNaN(constT)) {
        constT = 0;
    }

    const cxT = constT * (rx * yT) / ry;
    const cyT = - constT * (ry * xT) / rx;

    const cx = cosine * cxT - sine * cyT + (x1 + x2) / 2;
    const cy = sine * cxT + cosine * cyT + (y1 + y2) / 2;


    const uX = (xT - cxT) / rx;
    const uY = (yT - cyT) / ry;
    const vX = -(xT + cxT) / rx;
    const vY = -(yT + cyT) / ry;

    const startAngle = (uY >= 0 ? 1 : -1) * deg(Math.acos(uX / Math.sqrt(uX * uX + uY * uY)));

    const angleCosine = round((uX * vX + uY * vY) / (Math.sqrt(uX * uX + uY * uY) * Math.sqrt(vX * vX + vY * vY)), 10);
    let angle = (uX * vY - uY * vX >= 0 ? 1 : -1) * deg(Math.acos(angleCosine));

    if (!swipe && angle > 0) {
        angle -= 360;
    }

    if (swipe && angle < 0) {
        angle += 360;
    }
    let endAngle = startAngle + angle;
    const signEndAngle = endAngle >= 0 ? 1 : -1;
    endAngle = (Math.abs(endAngle) % 360) * signEndAngle;

    return {
        center: new Point(cx, cy),
        startAngle: startAngle,
        endAngle: endAngle,
        radiusX: rx,
        radiusY: ry,
        xRotation: rotation
    };
}

function bboxStartAngle(angle, start) {
    let startAngle = angle;

    while (startAngle < start) {
        startAngle += 90;
    }

    return startAngle;
}

export default Arc;
