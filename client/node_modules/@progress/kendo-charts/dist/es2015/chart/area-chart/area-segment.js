import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';
import LineSegment from '../line-chart/line-segment';

import { append, deepExtend, isFunction, last } from '../../common';

class AreaSegment extends LineSegment {
    constructor(linePoints, currentSeries, seriesIx, prevSegment, stackPoints) {
        super(linePoints, currentSeries, seriesIx);

        this.prevSegment = prevSegment;
        this.stackPoints = stackPoints;
    }

    createVisual() {
        const series = this.series;
        const defaults = series._defaults;
        const lineOptions = series.line || {};
        let color = series.color;

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
    }

    strokeSegments() {
        let segments = this._strokeSegments;

        if (!segments) {
            segments = this._strokeSegments = this.createStrokeSegments();
        }

        return segments;
    }

    createStrokeSegments() {
        return this.segmentsFromPoints(this.points());
    }

    stackSegments() {
        if (this.prevSegment) {
            return this.prevSegment.createStackSegments(this.stackPoints);
        }

        return this.createStackSegments(this.stackPoints);
    }

    createStackSegments(stackPoints) {
        return this.segmentsFromPoints(this.toGeometryPoints(stackPoints)).reverse();
    }

    segmentsFromPoints(points) {
        return points.map((point) => new geom.Segment(point));
    }

    createStroke(style) {
        const stroke = new draw.Path(style);
        stroke.segments.push.apply(stroke.segments, this.strokeSegments());

        this.visual.append(stroke);
    }

    hasStackSegment() {
        return this.prevSegment || (this.stackPoints && this.stackPoints.length);
    }

    createFill(style) {
        const strokeSegments = this.strokeSegments();
        const fillSegments = strokeSegments.slice(0);
        const hasStackSegments = this.hasStackSegment();

        if (hasStackSegments) {
            const stackSegments = this.stackSegments();

            append(fillSegments, stackSegments);
        }

        const fill = new draw.Path(style);
        fill.segments.push.apply(fill.segments, fillSegments);

        if (!hasStackSegments && strokeSegments.length > 1) {
            this.fillToAxes(fill);
        }

        this.visual.append(fill);
    }

    fillToAxes(fillPath) {
        const chart = this.parent;
        const invertAxes = chart.options.invertAxes;
        const valueAxis = chart.seriesValueAxis(this.series);
        const crossingValue = chart.categoryAxisCrossingValue(valueAxis);
        const endSlot = valueAxis.getSlot(crossingValue, crossingValue, true);
        const segments = this.strokeSegments();
        const firstPoint = segments[0].anchor();
        const lastPoint = last(segments).anchor();
        let end = invertAxes ? endSlot.x1 : endSlot.y1;

        if (invertAxes) {
            fillPath.lineTo(end, lastPoint.y)
                    .lineTo(end, firstPoint.y);
        } else {
            fillPath.lineTo(lastPoint.x, end)
                    .lineTo(firstPoint.x, end);
        }
    }
}

export default AreaSegment;