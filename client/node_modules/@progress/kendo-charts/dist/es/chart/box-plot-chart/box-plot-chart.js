import CandlestickChart from '../candlestick-chart/candlestick-chart';
import VerticalBoxPlot from './vertical-box-plot';
import BoxPlot from './box-plot';
import ClusterLayout from '../layout/cluster-layout';

import areNumbers from '../utils/are-numbers';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { defined } from '../../common';

var BoxPlotChart = (function (CandlestickChart) {
    function BoxPlotChart () {
        CandlestickChart.apply(this, arguments);
    }

    if ( CandlestickChart ) BoxPlotChart.__proto__ = CandlestickChart;
    BoxPlotChart.prototype = Object.create( CandlestickChart && CandlestickChart.prototype );
    BoxPlotChart.prototype.constructor = BoxPlotChart;

    BoxPlotChart.prototype.addValue = function addValue (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var ref = this;
        var children = ref.children;
        var options = ref.options;
        var value = data.valueFields;
        var valueParts = this.splitValue(value);
        var hasValue = areNumbers(valueParts);
        var dataItem = series.data[categoryIx];
        var categoryPoints = this.categoryPoints[categoryIx];
        var point;

        if (!categoryPoints) {
            this.categoryPoints[categoryIx] = categoryPoints = [];
        }

        if (hasValue) {
            point = this.createPoint(data, fields);
        }

        var cluster = children[categoryIx];
        if (!cluster) {
            cluster = new ClusterLayout({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        if (point) {
            this.updateRange(value, fields);

            cluster.append(point);

            point.categoryIx = categoryIx;
            point.category = category;
            point.series = series;
            point.seriesIx = seriesIx;
            point.owner = this;
            point.dataItem = dataItem;
        }

        this.points.push(point);
        categoryPoints.push(point);
    };

    BoxPlotChart.prototype.pointType = function pointType () {
        if (this.options.invertAxes) {
            return VerticalBoxPlot;
        }

        return BoxPlot;
    };

    BoxPlotChart.prototype.splitValue = function splitValue (value) {
        return [
            value.lower, value.q1, value.median,
            value.q3, value.upper
        ];
    };

    BoxPlotChart.prototype.updateRange = function updateRange (value, fields) {
        var axisName = fields.series.axis;
        var axisRange = this.valueAxisRanges[axisName];
        var parts = this.splitValue(value).concat(this.filterOutliers(value.outliers));

        if (defined(value.mean)) {
            parts = parts.concat(value.mean);
        }

        axisRange = this.valueAxisRanges[axisName] =
            axisRange || { min: MAX_VALUE, max: MIN_VALUE };

        axisRange = this.valueAxisRanges[axisName] = {
            min: Math.min.apply(Math, parts.concat([ axisRange.min ])),
            max: Math.max.apply(Math, parts.concat([ axisRange.max ]))
        };
    };

    BoxPlotChart.prototype.formatPointValue = function formatPointValue (point, format) {
        var value = point.value;

        return this.chartService.format.auto(format,
            value.lower, value.q1, value.median,
            value.q3, value.upper, value.mean, point.category
        );
    };

    BoxPlotChart.prototype.filterOutliers = function filterOutliers (items) {
        var length = (items || []).length;
        var result = [];

        for (var i = 0; i < length; i++) {
            var item = items[i];
            if (defined(item) && item !== null) {
                result.push(item);
            }
        }

        return result;
    };

    return BoxPlotChart;
}(CandlestickChart));

export default BoxPlotChart;