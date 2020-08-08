import { ZERO, INTERPOLATE } from '../constants';

import { Point } from '../../core';
import { MAX_VALUE } from '../../common/constants';
import { defined } from '../../common';

const LineChartMixin = {
    renderSegments: function() {
        const { options, seriesPoints } = this;
        const series = options.series;
        const seriesCount = seriesPoints.length;
        let lastSegment;

        this._segments = [];

        for (let seriesIx = 0; seriesIx < seriesCount; seriesIx++) {
            const currentSeries = series[seriesIx];
            const sortedPoints = this.sortPoints(seriesPoints[seriesIx]);
            const pointCount = sortedPoints.length;
            let linePoints = [];

            for (let pointIx = 0; pointIx < pointCount; pointIx++) {
                const point = sortedPoints[pointIx];
                if (point) {
                    linePoints.push(point);
                } else if (this.seriesMissingValues(currentSeries) !== INTERPOLATE) {
                    if (linePoints.length > 1) {
                        lastSegment = this.createSegment(
                            linePoints, currentSeries, seriesIx, lastSegment
                        );
                        this._addSegment(lastSegment);
                    }
                    linePoints = [];
                }
            }

            if (linePoints.length > 1) {
                lastSegment = this.createSegment(
                    linePoints, currentSeries, seriesIx, lastSegment
                );
                this._addSegment(lastSegment);
            }
        }

        this.children.unshift.apply(this.children, this._segments);
    },

    _addSegment: function(segment) {
        this._segments.push(segment);
        segment.parent = this;
    },

    sortPoints: function(points) {
        return points;
    },

    seriesMissingValues: function(series) {
        const missingValues = series.missingValues;
        const assumeZero = !missingValues && this.options.isStacked;

        return assumeZero ? ZERO : missingValues || INTERPOLATE;
    },

    getNearestPoint: function(x, y, seriesIx) {
        const target = new Point(x, y);
        const allPoints = this.seriesPoints[seriesIx];
        let nearestPointDistance = MAX_VALUE;
        let nearestPoint;

        for (let i = 0; i < allPoints.length; i++) {
            const point = allPoints[i];

            if (point && defined(point.value) && point.value !== null && point.visible !== false) {
                const pointBox = point.box;
                const pointDistance = pointBox.center().distanceTo(target);

                if (pointDistance < nearestPointDistance) {
                    nearestPoint = point;
                    nearestPointDistance = pointDistance;
                }
            }
        }

        return nearestPoint;
    }
};

export default LineChartMixin;