import BarChart from '../bar-chart/bar-chart';
import SeriesBinder from '../series-binder';
import WaterfallSegment from './waterfall-segment';

import categoriesCount from '../utils/categories-count';

import { isNumber } from '../../common';

class WaterfallChart extends BarChart {
    render() {
        super.render();
        this.createSegments();
    }

    traverseDataPoints(callback) {
        const series = this.options.series;
        const totalCategories = categoriesCount(series);
        const isVertical = !this.options.invertAxes;

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const currentSeries = series[seriesIx];
            let total = 0;
            let runningTotal = 0;

            for (let categoryIx = 0; categoryIx < totalCategories; categoryIx++) {
                const data = SeriesBinder.current.bindPoint(currentSeries, categoryIx);
                const value = data.valueFields.value;
                const summary = data.fields.summary;
                let from = total;
                let to;

                if (summary) {
                    if (summary.toLowerCase() === "total") {
                        data.valueFields.value = total;
                        from = 0;
                        to = total;
                    } else {
                        data.valueFields.value = runningTotal;
                        to = from - runningTotal;
                        runningTotal = 0;
                    }
                } else if (isNumber(value)) {
                    runningTotal += value;
                    total += value;
                    to = total;
                }

                callback(data, {
                    category: this.categoryAxis.categoryAt(categoryIx),
                    categoryIx: categoryIx,
                    series: currentSeries,
                    seriesIx: seriesIx,
                    total: total,
                    runningTotal: runningTotal,
                    from: from,
                    to: to,
                    isVertical: isVertical
                });
            }
        }
    }

    updateRange(value, fields) {
        super.updateRange({ value: fields.to }, fields);
    }

    aboveAxis(point) {
        return point.value >= 0;
    }

    plotRange(point) {
        return [ point.from, point.to ];
    }

    createSegments() {
        const series = this.options.series;
        const seriesPoints = this.seriesPoints;
        const segments = this.segments = [];

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const currentSeries = series[seriesIx];
            const points = seriesPoints[seriesIx];

            if (points) {
                let prevPoint;
                for (let pointIx = 0; pointIx < points.length; pointIx++) {
                    const point = points[pointIx];

                    if (point && prevPoint) {
                        const segment = new WaterfallSegment(prevPoint, point, currentSeries);
                        segments.push(segment);
                        this.append(segment);
                    }

                    prevPoint = point;
                }
            }
        }
    }
}

export default WaterfallChart;