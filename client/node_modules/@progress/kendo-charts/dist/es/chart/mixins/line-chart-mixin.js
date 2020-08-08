import { ZERO, INTERPOLATE } from '../constants';

import { Point } from '../../core';
import { MAX_VALUE } from '../../common/constants';
import { defined } from '../../common';

var LineChartMixin = {
    renderSegments: function() {
        var this$1 = this;

        var ref = this;
        var options = ref.options;
        var seriesPoints = ref.seriesPoints;
        var series = options.series;
        var seriesCount = seriesPoints.length;
        var lastSegment;

        this._segments = [];

        for (var seriesIx = 0; seriesIx < seriesCount; seriesIx++) {
            var currentSeries = series[seriesIx];
            var sortedPoints = this$1.sortPoints(seriesPoints[seriesIx]);
            var pointCount = sortedPoints.length;
            var linePoints = [];

            for (var pointIx = 0; pointIx < pointCount; pointIx++) {
                var point = sortedPoints[pointIx];
                if (point) {
                    linePoints.push(point);
                } else if (this$1.seriesMissingValues(currentSeries) !== INTERPOLATE) {
                    if (linePoints.length > 1) {
                        lastSegment = this$1.createSegment(
                            linePoints, currentSeries, seriesIx, lastSegment
                        );
                        this$1._addSegment(lastSegment);
                    }
                    linePoints = [];
                }
            }

            if (linePoints.length > 1) {
                lastSegment = this$1.createSegment(
                    linePoints, currentSeries, seriesIx, lastSegment
                );
                this$1._addSegment(lastSegment);
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
        var missingValues = series.missingValues;
        var assumeZero = !missingValues && this.options.isStacked;

        return assumeZero ? ZERO : missingValues || INTERPOLATE;
    },

    getNearestPoint: function(x, y, seriesIx) {
        var target = new Point(x, y);
        var allPoints = this.seriesPoints[seriesIx];
        var nearestPointDistance = MAX_VALUE;
        var nearestPoint;

        for (var i = 0; i < allPoints.length; i++) {
            var point = allPoints[i];

            if (point && defined(point.value) && point.value !== null && point.visible !== false) {
                var pointBox = point.box;
                var pointDistance = pointBox.center().distanceTo(target);

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