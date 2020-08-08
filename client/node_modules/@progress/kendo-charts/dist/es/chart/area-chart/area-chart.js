import LineChart from '../line-chart/line-chart';
import LinePoint from '../line-chart/line-point';

import AreaSegment from './area-segment';
import StepAreaSegment from './step-area-segment';
import SplineAreaSegment from './spline-area-segment';

import { STEP, SMOOTH, ZERO } from '../constants';

var AreaChart = (function (LineChart) {
    function AreaChart () {
        LineChart.apply(this, arguments);
    }

    if ( LineChart ) AreaChart.__proto__ = LineChart;
    AreaChart.prototype = Object.create( LineChart && LineChart.prototype );
    AreaChart.prototype.constructor = AreaChart;

    AreaChart.prototype.createSegment = function createSegment (linePoints, currentSeries, seriesIx, prevSegment) {
        var isStacked = this.options.isStacked;
        var style = (currentSeries.line || {}).style;
        var previousSegment;

        var stackPoints;
        if (isStacked && seriesIx > 0 && prevSegment) {
            var missingValues = this.seriesMissingValues(currentSeries);
            if (missingValues !== "gap") {
                stackPoints = prevSegment.linePoints;
                previousSegment = prevSegment;
            } else {
                stackPoints = this._gapStackPoints(linePoints, seriesIx, style);
            }
        }

        var pointType;
        if (style === STEP) {
            pointType = StepAreaSegment;
        } else if (style === SMOOTH) {
            pointType = SplineAreaSegment;
        } else {
            pointType = AreaSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx, previousSegment, stackPoints);
    };

    AreaChart.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        LineChart.prototype.reflow.call(this, targetBox);

        var stackPoints = this._stackPoints;
        if (stackPoints) {
            for (var idx = 0; idx < stackPoints.length; idx++) {
                var stackPoint = stackPoints[idx];
                var pointSlot = this$1.categoryAxis.getSlot(stackPoint.categoryIx);
                stackPoint.reflow(pointSlot);
            }
        }
    };

    AreaChart.prototype._gapStackPoints = function _gapStackPoints (linePoints, seriesIx, style) {
        var this$1 = this;

        var seriesPoints = this.seriesPoints;
        var startIdx = linePoints[0].categoryIx;
        var length = linePoints.length;
        if (startIdx < 0) {
            startIdx = 0;
            length--;
        }

        var endIdx = startIdx + length;
        var pointOffset = this.seriesOptions[0]._outOfRangeMinPoint ? 1 : 0;
        var stackPoints = [];

        this._stackPoints = this._stackPoints || [];
        for (var categoryIx = startIdx; categoryIx < endIdx; categoryIx++) {
            var pointIx = categoryIx + pointOffset;
            var currentSeriesIx = seriesIx;
            var point = (void 0);

            do {
                currentSeriesIx--;
                point = seriesPoints[currentSeriesIx][pointIx];
            } while (currentSeriesIx > 0 && !point);

            if (point) {
                if (style !== STEP && categoryIx > startIdx && !seriesPoints[currentSeriesIx][pointIx - 1]) {
                    stackPoints.push(this$1._previousSegmentPoint(categoryIx, pointIx, pointIx - 1, currentSeriesIx));
                }

                stackPoints.push(point);

                if (style !== STEP && categoryIx + 1 < endIdx && !seriesPoints[currentSeriesIx][pointIx + 1]) {
                    stackPoints.push(this$1._previousSegmentPoint(categoryIx, pointIx, pointIx + 1, currentSeriesIx));
                }
            } else {
                var gapStackPoint = this$1._createGapStackPoint(categoryIx);
                this$1._stackPoints.push(gapStackPoint);
                stackPoints.push(gapStackPoint);
            }
        }

        return stackPoints;
    };

    AreaChart.prototype._previousSegmentPoint = function _previousSegmentPoint (categoryIx, pointIx, segmentIx, seriesIdx) {
        var seriesPoints = this.seriesPoints;
        var index = seriesIdx;
        var point;

        while (index > 0 && !point) {
            index--;
            point = seriesPoints[index][segmentIx];
        }

        if (!point) {
            point = this._createGapStackPoint(categoryIx);
            this._stackPoints.push(point);
        } else {
            point = seriesPoints[index][pointIx];
        }

        return point;
    };

    AreaChart.prototype._createGapStackPoint = function _createGapStackPoint (categoryIx) {
        var options = this.pointOptions({}, 0);
        var point = new LinePoint(0, options);
        point.categoryIx = categoryIx;
        point.series = {};

        return point;
    };

    AreaChart.prototype.seriesMissingValues = function seriesMissingValues (series) {
        return series.missingValues || ZERO;
    };

    return AreaChart;
}(LineChart));

export default AreaChart;