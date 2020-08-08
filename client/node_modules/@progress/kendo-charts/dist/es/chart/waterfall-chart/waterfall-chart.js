import BarChart from '../bar-chart/bar-chart';
import SeriesBinder from '../series-binder';
import WaterfallSegment from './waterfall-segment';

import categoriesCount from '../utils/categories-count';

import { isNumber } from '../../common';

var WaterfallChart = (function (BarChart) {
    function WaterfallChart () {
        BarChart.apply(this, arguments);
    }

    if ( BarChart ) WaterfallChart.__proto__ = BarChart;
    WaterfallChart.prototype = Object.create( BarChart && BarChart.prototype );
    WaterfallChart.prototype.constructor = WaterfallChart;

    WaterfallChart.prototype.render = function render () {
        BarChart.prototype.render.call(this);
        this.createSegments();
    };

    WaterfallChart.prototype.traverseDataPoints = function traverseDataPoints (callback) {
        var this$1 = this;

        var series = this.options.series;
        var totalCategories = categoriesCount(series);
        var isVertical = !this.options.invertAxes;

        for (var seriesIx = 0; seriesIx < series.length; seriesIx++) {
            var currentSeries = series[seriesIx];
            var total = 0;
            var runningTotal = 0;

            for (var categoryIx = 0; categoryIx < totalCategories; categoryIx++) {
                var data = SeriesBinder.current.bindPoint(currentSeries, categoryIx);
                var value = data.valueFields.value;
                var summary = data.fields.summary;
                var from = total;
                var to = (void 0);

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
                    category: this$1.categoryAxis.categoryAt(categoryIx),
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
    };

    WaterfallChart.prototype.updateRange = function updateRange (value, fields) {
        BarChart.prototype.updateRange.call(this, { value: fields.to }, fields);
    };

    WaterfallChart.prototype.aboveAxis = function aboveAxis (point) {
        return point.value >= 0;
    };

    WaterfallChart.prototype.plotRange = function plotRange (point) {
        return [ point.from, point.to ];
    };

    WaterfallChart.prototype.createSegments = function createSegments () {
        var this$1 = this;

        var series = this.options.series;
        var seriesPoints = this.seriesPoints;
        var segments = this.segments = [];

        for (var seriesIx = 0; seriesIx < series.length; seriesIx++) {
            var currentSeries = series[seriesIx];
            var points = seriesPoints[seriesIx];

            if (points) {
                var prevPoint = (void 0);
                for (var pointIx = 0; pointIx < points.length; pointIx++) {
                    var point = points[pointIx];

                    if (point && prevPoint) {
                        var segment = new WaterfallSegment(prevPoint, point, currentSeries);
                        segments.push(segment);
                        this$1.append(segment);
                    }

                    prevPoint = point;
                }
            }
        }
    };

    return WaterfallChart;
}(BarChart));

export default WaterfallChart;