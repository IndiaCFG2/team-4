import LineChart from '../line-chart/line-chart';
import LinePoint from '../line-chart/line-point';

import AreaSegment from './area-segment';
import StepAreaSegment from './step-area-segment';
import SplineAreaSegment from './spline-area-segment';

import { STEP, SMOOTH, ZERO } from '../constants';

class AreaChart extends LineChart {
    createSegment(linePoints, currentSeries, seriesIx, prevSegment) {
        const isStacked = this.options.isStacked;
        const style = (currentSeries.line || {}).style;
        let previousSegment;

        let stackPoints;
        if (isStacked && seriesIx > 0 && prevSegment) {
            const missingValues = this.seriesMissingValues(currentSeries);
            if (missingValues !== "gap") {
                stackPoints = prevSegment.linePoints;
                previousSegment = prevSegment;
            } else {
                stackPoints = this._gapStackPoints(linePoints, seriesIx, style);
            }
        }

        let pointType;
        if (style === STEP) {
            pointType = StepAreaSegment;
        } else if (style === SMOOTH) {
            pointType = SplineAreaSegment;
        } else {
            pointType = AreaSegment;
        }

        return new pointType(linePoints, currentSeries, seriesIx, previousSegment, stackPoints);
    }

    reflow(targetBox) {
        super.reflow(targetBox);

        const stackPoints = this._stackPoints;
        if (stackPoints) {
            for (let idx = 0; idx < stackPoints.length; idx++) {
                const stackPoint = stackPoints[idx];
                const pointSlot = this.categoryAxis.getSlot(stackPoint.categoryIx);
                stackPoint.reflow(pointSlot);
            }
        }
    }

    _gapStackPoints(linePoints, seriesIx, style) {
        const seriesPoints = this.seriesPoints;
        let startIdx = linePoints[0].categoryIx;
        let length = linePoints.length;
        if (startIdx < 0) {
            startIdx = 0;
            length--;
        }

        const endIdx = startIdx + length;
        const pointOffset = this.seriesOptions[0]._outOfRangeMinPoint ? 1 : 0;
        const stackPoints = [];

        this._stackPoints = this._stackPoints || [];
        for (let categoryIx = startIdx; categoryIx < endIdx; categoryIx++) {
            const pointIx = categoryIx + pointOffset;
            let currentSeriesIx = seriesIx;
            let point;

            do {
                currentSeriesIx--;
                point = seriesPoints[currentSeriesIx][pointIx];
            } while (currentSeriesIx > 0 && !point);

            if (point) {
                if (style !== STEP && categoryIx > startIdx && !seriesPoints[currentSeriesIx][pointIx - 1]) {
                    stackPoints.push(this._previousSegmentPoint(categoryIx, pointIx, pointIx - 1, currentSeriesIx));
                }

                stackPoints.push(point);

                if (style !== STEP && categoryIx + 1 < endIdx && !seriesPoints[currentSeriesIx][pointIx + 1]) {
                    stackPoints.push(this._previousSegmentPoint(categoryIx, pointIx, pointIx + 1, currentSeriesIx));
                }
            } else {
                const gapStackPoint = this._createGapStackPoint(categoryIx);
                this._stackPoints.push(gapStackPoint);
                stackPoints.push(gapStackPoint);
            }
        }

        return stackPoints;
    }

    _previousSegmentPoint(categoryIx, pointIx, segmentIx, seriesIdx) {
        const seriesPoints = this.seriesPoints;
        let index = seriesIdx;
        let point;

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
    }

    _createGapStackPoint(categoryIx) {
        const options = this.pointOptions({}, 0);
        const point = new LinePoint(0, options);
        point.categoryIx = categoryIx;
        point.series = {};

        return point;
    }

    seriesMissingValues(series) {
        return series.missingValues || ZERO;
    }
}

export default AreaChart;