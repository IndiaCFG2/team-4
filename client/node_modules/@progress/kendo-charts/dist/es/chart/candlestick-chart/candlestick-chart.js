import CategoricalChart from '../categorical-chart';
import ClusterLayout from '../layout/cluster-layout';
import Candlestick from './candlestick';

import ClipAnimationMixin from '../mixins/clip-animation-mixin';
import { CANDLESTICK } from '../constants';
import areNumbers from '../utils/are-numbers';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { deepExtend, isFunction } from '../../common';

var CandlestickChart = (function (CategoricalChart) {
    function CandlestickChart () {
        CategoricalChart.apply(this, arguments);
    }

    if ( CategoricalChart ) CandlestickChart.__proto__ = CategoricalChart;
    CandlestickChart.prototype = Object.create( CategoricalChart && CategoricalChart.prototype );
    CandlestickChart.prototype.constructor = CandlestickChart;

    CandlestickChart.prototype.reflowCategories = function reflowCategories (categorySlots) {
        var children = this.children;
        var childrenLength = children.length;

        for (var i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    };

    CandlestickChart.prototype.addValue = function addValue (data, fields) {
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
            point.noteText = data.fields.noteText;
        }

        this.points.push(point);
        categoryPoints.push(point);
    };

    CandlestickChart.prototype.pointType = function pointType () {
        return Candlestick;
    };

    CandlestickChart.prototype.createPoint = function createPoint (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var pointType = this.pointType();
        var value = data.valueFields;
        var pointOptions = deepExtend({}, series);
        var color = data.fields.color || series.color;

        pointOptions = this.evalPointOptions(
            pointOptions, value, category, categoryIx, series, seriesIx
        );

        if (series.type === CANDLESTICK) {
            if (value.open > value.close) {
                color = data.fields.downColor || series.downColor || series.color;
            }
        }

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        pointOptions.vertical = !this.options.invertAxes;

        var point = new pointType(value, pointOptions);
        point.color = color;

        return point;
    };

    CandlestickChart.prototype.splitValue = function splitValue (value) {
        return [ value.low, value.open, value.close, value.high ];
    };

    CandlestickChart.prototype.updateRange = function updateRange (value, fields) {
        var axisName = fields.series.axis;
        var parts = this.splitValue(value);
        var axisRange = this.valueAxisRanges[axisName];

        axisRange = this.valueAxisRanges[axisName] =
            axisRange || { min: MAX_VALUE, max: MIN_VALUE };

        axisRange = this.valueAxisRanges[axisName] = {
            min: Math.min.apply(Math, parts.concat([ axisRange.min ])),
            max: Math.max.apply(Math, parts.concat([ axisRange.max ]))
        };
    };

    CandlestickChart.prototype.formatPointValue = function formatPointValue (point, format) {
        var value = point.value;

        return this.chartService.format.auto(format,
            value.open, value.high,
            value.low, value.close, point.category
        );
    };

    CandlestickChart.prototype.animationPoints = function animationPoints () {
        return this.points;
    };

    return CandlestickChart;
}(CategoricalChart));

deepExtend(CandlestickChart.prototype, ClipAnimationMixin);

export default CandlestickChart;