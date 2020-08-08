import BarChart from '../bar-chart/bar-chart';
import RangeBar from './range-bar';
import CategoricalChart from '../categorical-chart';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { isNumber } from '../../common';

var RangeBarChart = (function (BarChart) {
    function RangeBarChart () {
        BarChart.apply(this, arguments);
    }

    if ( BarChart ) RangeBarChart.__proto__ = BarChart;
    RangeBarChart.prototype = Object.create( BarChart && BarChart.prototype );
    RangeBarChart.prototype.constructor = RangeBarChart;

    RangeBarChart.prototype.pointType = function pointType () {
        return RangeBar;
    };

    RangeBarChart.prototype.pointValue = function pointValue (data) {
        return data.valueFields;
    };

    RangeBarChart.prototype.formatPointValue = function formatPointValue (point, format) {
        if (point.value.from === null && point.value.to === null) {
            return "";
        }

        return this.chartService.format.auto(format, point.value.from, point.value.to);
    };

    RangeBarChart.prototype.plotRange = function plotRange (point) {
        if (!point) {
            return 0;
        }

        return [ point.value.from, point.value.to ];
    };

    RangeBarChart.prototype.updateRange = function updateRange (value, fields) {
        var axisName = fields.series.axis;
        var from = value.from;
        var to = value.to;
        var axisRange = this.valueAxisRanges[axisName];

        if (value !== null && isNumber(from) && isNumber(to)) {
            axisRange = this.valueAxisRanges[axisName] = axisRange || { min: MAX_VALUE, max: MIN_VALUE };

            axisRange.min = Math.min(axisRange.min, from);
            axisRange.max = Math.max(axisRange.max, from);

            axisRange.min = Math.min(axisRange.min, to);
            axisRange.max = Math.max(axisRange.max, to);
        }
    };

    RangeBarChart.prototype.aboveAxis = function aboveAxis (point) {
        var value = point.value;
        return value.from < value.to;
    };

    return RangeBarChart;
}(BarChart));

RangeBarChart.prototype.plotLimits = CategoricalChart.prototype.plotLimits;

export default RangeBarChart;