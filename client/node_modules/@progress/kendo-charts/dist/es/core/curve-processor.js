import { geometry as geom } from '@progress/kendo-drawing';

import { X, Y } from '../common/constants';
import { Class, last, round } from '../common';

var WEIGHT = 0.333;
var EXTREMUM_ALLOWED_DEVIATION = 0.01;

var CurveProcessor = (function (Class) {
    function CurveProcessor(closed) {
        Class.call(this);

        this.closed = closed;
    }

    if ( Class ) CurveProcessor.__proto__ = Class;
    CurveProcessor.prototype = Object.create( Class && Class.prototype );
    CurveProcessor.prototype.constructor = CurveProcessor;

    CurveProcessor.prototype.process = function process (dataPoints) {
        var this$1 = this;

        var points = dataPoints.slice(0);
        var segments = [];
        var closed = this.closed;
        var length = points.length;

        if (length > 2) {
            this.removeDuplicates(0, points);
            length = points.length;
        }

        if (length < 2 || (length === 2 && points[0].equals(points[1]))) {
            return segments;
        }

        var p0 = points[0];
        var p1 = points[1];
        var p2 = points[2];

        segments.push(new geom.Segment(p0));

        while (p0.equals(points[length - 1])) {
            closed = true;
            points.pop();
            length--;
        }

        if (length === 2) {
            var tangent = this.tangent(p0,p1, X, Y);

            last(segments).controlOut(
                this.firstControlPoint(tangent, p0, p1, X, Y)
            );

            segments.push(new geom.Segment(
                p1,
                this.secondControlPoint(tangent, p0, p1, X, Y)
            ));

            return segments;
        }

        var initialControlPoint, lastControlPoint;

        if (closed) {
            p0 = points[length - 1]; p1 = points[0]; p2 = points[1];
            var controlPoints = this.controlPoints(p0, p1, p2);
            initialControlPoint = controlPoints[1];
            lastControlPoint = controlPoints[0];
        } else {
            var tangent$1 = this.tangent(p0, p1, X,Y);
            initialControlPoint = this.firstControlPoint(tangent$1, p0, p1, X, Y);
        }

        var cp0 = initialControlPoint;
        for (var idx = 0; idx <= length - 3; idx++) {
            this$1.removeDuplicates(idx, points);
            length = points.length;
            if (idx + 3 <= length) {
                p0 = points[idx]; p1 = points[idx + 1]; p2 = points[idx + 2];
                var controlPoints$1 = this$1.controlPoints(p0,p1,p2);

                last(segments).controlOut(cp0);
                cp0 = controlPoints$1[1];

                var cp1 = controlPoints$1[0];
                segments.push(new geom.Segment(p1, cp1));
            }
        }

        if (closed) {
            p0 = points[length - 2]; p1 = points[length - 1]; p2 = points[0];
            var controlPoints$2 = this.controlPoints(p0, p1, p2);

            last(segments).controlOut(cp0);
            segments.push(new geom.Segment(
                p1,
                controlPoints$2[0]
            ));

            last(segments).controlOut(controlPoints$2[1]);
            segments.push(new geom.Segment(
                p2,
                lastControlPoint
            ));
        } else {
            var tangent$2 = this.tangent(p1, p2, X, Y);

            last(segments).controlOut(cp0);
            segments.push(new geom.Segment(
                p2,
                this.secondControlPoint(tangent$2, p1, p2, X, Y)
            ));
        }

        return segments;
    };

    CurveProcessor.prototype.removeDuplicates = function removeDuplicates (idx, points) {
        while (points[idx + 1] && (points[idx].equals(points[idx + 1]) || points[idx + 1].equals(points[idx + 2]))) {
            points.splice(idx + 1, 1);
        }
    };

    CurveProcessor.prototype.invertAxis = function invertAxis (p0, p1, p2) {
        var invertAxis = false;

        if (p0.x === p1.x) {
            invertAxis = true;
        } else if (p1.x === p2.x) {
            if ((p1.y < p2.y && p0.y <= p1.y) || (p2.y < p1.y && p1.y <= p0.y)) {
                invertAxis = true;
            }
        } else {
            var fn = this.lineFunction(p0,p1);
            var y2 = this.calculateFunction(fn, p2.x);
            if (!(p0.y <= p1.y && p2.y <= y2) &&
                !(p1.y <= p0.y && p2.y >= y2)) {
                invertAxis = true;
            }
        }

        return invertAxis;
    };

    CurveProcessor.prototype.isLine = function isLine (p0, p1, p2) {
        var fn = this.lineFunction(p0, p1);
        var y2 = this.calculateFunction(fn, p2.x);

        return (p0.x === p1.x && p1.x === p2.x) || round(y2, 1) === round(p2.y, 1);
    };

    CurveProcessor.prototype.lineFunction = function lineFunction (p1, p2) {
        var a = (p2.y - p1.y) / (p2.x - p1.x);
        var b = p1.y - a * p1.x;

        return [ b, a ];
    };

    CurveProcessor.prototype.controlPoints = function controlPoints (p0, p1, p2) {
        var xField = X;
        var yField = Y;
        var restrict = false;
        var switchOrientation = false;
        var tangent;

        if (this.isLine(p0, p1, p2)) {
            tangent = this.tangent(p0, p1, X, Y);
        } else {
            var monotonic = {
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
                    var sign;
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

        var secondControlPoint = this.secondControlPoint(tangent, p0, p1, xField, yField);

        if (switchOrientation) {
            var oldXField = xField;
            xField = yField;
            yField = oldXField;
        }

        var firstControlPoint = this.firstControlPoint(tangent, p1, p2, xField, yField);

        if (restrict) {
            this.restrictControlPoint(p0, p1, secondControlPoint, tangent);
            this.restrictControlPoint(p1, p2, firstControlPoint, tangent);
        }

        return [ secondControlPoint, firstControlPoint ];
    };

    CurveProcessor.prototype.restrictControlPoint = function restrictControlPoint (p1, p2, cp, tangent) {
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
    };

    CurveProcessor.prototype.tangent = function tangent (p0, p1, xField, yField) {
        var x = p1[xField] - p0[xField];
        var y = p1[yField] - p0[yField];
        var tangent;

        if (x === 0) {
            tangent = 0;
        } else {
            tangent = y / x;
        }

        return tangent;
    };

    CurveProcessor.prototype.isMonotonicByField = function isMonotonicByField (p0, p1, p2, field) {
        return (p2[field] > p1[field] && p1[field] > p0[field]) ||
                    (p2[field] < p1[field] && p1[field] < p0[field]);
    };

    CurveProcessor.prototype.firstControlPoint = function firstControlPoint (tangent, p0, p3, xField, yField) {
        var t1 = p0[xField];
        var t2 = p3[xField];
        var distance = (t2 - t1) * WEIGHT;

        return this.point(t1 + distance, p0[yField] + distance * tangent, xField, yField);
    };

    CurveProcessor.prototype.secondControlPoint = function secondControlPoint (tangent, p0, p3, xField, yField) {
        var t1 = p0[xField];
        var t2 = p3[xField];
        var distance = (t2 - t1) * WEIGHT;

        return this.point(t2 - distance, p3[yField] - distance * tangent, xField, yField);
    };

    CurveProcessor.prototype.point = function point (xValue, yValue, xField, yField) {
        var controlPoint = new geom.Point();
        controlPoint[xField] = xValue;
        controlPoint[yField] = yValue;

        return controlPoint;
    };

    CurveProcessor.prototype.calculateFunction = function calculateFunction (fn, x) {
        var length = fn.length;
        var result = 0;

        for (var i = 0; i < length; i++) {
            result += Math.pow(x,i) * fn[i];
        }
        return result;
    };

    return CurveProcessor;
}(Class));

function numberSign(value) {
    return value <= 0 ? -1 : 1;
}

export default CurveProcessor;