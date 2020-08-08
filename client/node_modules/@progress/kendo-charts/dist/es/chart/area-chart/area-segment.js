import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';
import LineSegment from '../line-chart/line-segment';

import { append, deepExtend, isFunction, last } from '../../common';

var AreaSegment = (function (LineSegment) {
    function AreaSegment(linePoints, currentSeries, seriesIx, prevSegment, stackPoints) {
        LineSegment.call(this, linePoints, currentSeries, seriesIx);

        this.prevSegment = prevSegment;
        this.stackPoints = stackPoints;
    }

    if ( LineSegment ) AreaSegment.__proto__ = LineSegment;
    AreaSegment.prototype = Object.create( LineSegment && LineSegment.prototype );
    AreaSegment.prototype.constructor = AreaSegment;

    AreaSegment.prototype.createVisual = function createVisual () {
        var series = this.series;
        var defaults = series._defaults;
        var lineOptions = series.line || {};
        var color = series.color;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        this.visual = new draw.Group({
            zIndex: series.zIndex
        });

        this.createFill({
            fill: {
                color: color,
                opacity: series.opacity
            },
            stroke: null
        });

        if (lineOptions.width > 0 && lineOptions.visible !== false) {
            this.createStroke({
                stroke: deepExtend({
                    color: color,
                    opacity: series.opacity,
                    lineCap: "butt"
                }, lineOptions)
            });
        }
    };

    AreaSegment.prototype.strokeSegments = function strokeSegments () {
        var segments = this._strokeSegments;

        if (!segments) {
            segments = this._strokeSegments = this.createStrokeSegments();
        }

        return segments;
    };

    AreaSegment.prototype.createStrokeSegments = function createStrokeSegments () {
        return this.segmentsFromPoints(this.points());
    };

    AreaSegment.prototype.stackSegments = function stackSegments () {
        if (this.prevSegment) {
            return this.prevSegment.createStackSegments(this.stackPoints);
        }

        return this.createStackSegments(this.stackPoints);
    };

    AreaSegment.prototype.createStackSegments = function createStackSegments (stackPoints) {
        return this.segmentsFromPoints(this.toGeometryPoints(stackPoints)).reverse();
    };

    AreaSegment.prototype.segmentsFromPoints = function segmentsFromPoints (points) {
        return points.map(function (point) { return new geom.Segment(point); });
    };

    AreaSegment.prototype.createStroke = function createStroke (style) {
        var stroke = new draw.Path(style);
        stroke.segments.push.apply(stroke.segments, this.strokeSegments());

        this.visual.append(stroke);
    };

    AreaSegment.prototype.hasStackSegment = function hasStackSegment () {
        return this.prevSegment || (this.stackPoints && this.stackPoints.length);
    };

    AreaSegment.prototype.createFill = function createFill (style) {
        var strokeSegments = this.strokeSegments();
        var fillSegments = strokeSegments.slice(0);
        var hasStackSegments = this.hasStackSegment();

        if (hasStackSegments) {
            var stackSegments = this.stackSegments();

            append(fillSegments, stackSegments);
        }

        var fill = new draw.Path(style);
        fill.segments.push.apply(fill.segments, fillSegments);

        if (!hasStackSegments && strokeSegments.length > 1) {
            this.fillToAxes(fill);
        }

        this.visual.append(fill);
    };

    AreaSegment.prototype.fillToAxes = function fillToAxes (fillPath) {
        var chart = this.parent;
        var invertAxes = chart.options.invertAxes;
        var valueAxis = chart.seriesValueAxis(this.series);
        var crossingValue = chart.categoryAxisCrossingValue(valueAxis);
        var endSlot = valueAxis.getSlot(crossingValue, crossingValue, true);
        var segments = this.strokeSegments();
        var firstPoint = segments[0].anchor();
        var lastPoint = last(segments).anchor();
        var end = invertAxes ? endSlot.x1 : endSlot.y1;

        if (invertAxes) {
            fillPath.lineTo(end, lastPoint.y)
                    .lineTo(end, firstPoint.y);
        } else {
            fillPath.lineTo(lastPoint.x, end)
                    .lineTo(firstPoint.x, end);
        }
    };

    return AreaSegment;
}(LineSegment));

export default AreaSegment;