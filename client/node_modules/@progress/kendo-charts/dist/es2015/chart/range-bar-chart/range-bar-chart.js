import BarChart from '../bar-chart/bar-chart';
import RangeBar from './range-bar';
import CategoricalChart from '../categorical-chart';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { isNumber } from '../../common';

class RangeBarChart extends BarChart {
    pointType() {
        return RangeBar;
    }

    pointValue(data) {
        return data.valueFields;
    }

    formatPointValue(point, format) {
        if (point.value.from === null && point.value.to === null) {
            return "";
        }

        return this.chartService.format.auto(format, point.value.from, point.value.to);
    }

    plotRange(point) {
        if (!point) {
            return 0;
        }

        return [ point.value.from, point.value.to ];
    }

    updateRange(value, fields) {
        const axisName = fields.series.axis;
        const { from, to } = value;
        let axisRange = this.valueAxisRanges[axisName];

        if (value !== null && isNumber(from) && isNumber(to)) {
            axisRange = this.valueAxisRanges[axisName] = axisRange || { min: MAX_VALUE, max: MIN_VALUE };

            axisRange.min = Math.min(axisRange.min, from);
            axisRange.max = Math.max(axisRange.max, from);

            axisRange.min = Math.min(axisRange.min, to);
            axisRange.max = Math.max(axisRange.max, to);
        }
    }

    aboveAxis(point) {
        const value = point.value;
        return value.from < value.to;
    }
}

RangeBarChart.prototype.plotLimits = CategoricalChart.prototype.plotLimits;

export default RangeBarChart;