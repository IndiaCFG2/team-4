import SeriesBinder from '../series-binder';

import { OBJECT } from '../../common/constants';
import { Class, defined, getter, isArray, isNumber } from '../../common';

const STD_ERR = "stderr";
const STD_DEV = "stddev";
const percentRegex = /percent(?:\w*)\((\d+)\)/;
const standardDeviationRegex = new RegExp("^" + STD_DEV + "(?:\\((\\d+(?:\\.\\d+)?)\\))?$");

class ErrorRangeCalculator extends Class {
    constructor(errorValue, series, field) {
        super();

        this.initGlobalRanges(errorValue, series, field);
    }

    initGlobalRanges(errorValue, series, field) {
        const data = series.data;
        const deviationMatch = standardDeviationRegex.exec(errorValue);

        if (deviationMatch) {
            this.valueGetter = this.createValueGetter(series, field);

            const average = this.getAverage(data);
            const deviation = this.getStandardDeviation(data, average, false);
            const multiple = deviationMatch[1] ? parseFloat(deviationMatch[1]) : 1;
            const errorRange = { low: average.value - deviation * multiple, high: average.value + deviation * multiple };

            this.globalRange = function() {
                return errorRange;
            };
        } else if (errorValue.indexOf && errorValue.indexOf(STD_ERR) >= 0) {
            this.valueGetter = this.createValueGetter(series, field);
            const standardError = this.getStandardError(data, this.getAverage(data));

            this.globalRange = function(value) {
                return { low: value - standardError, high: value + standardError };
            };
        }
    }

    createValueGetter(series, field) {
        const data = series.data;
        const binder = SeriesBinder.current;
        const valueFields = binder.valueFields(series);
        const item = defined(data[0]) ? data[0] : {};
        let valueGetter;

        if (isArray(item)) {
            const index = field ? valueFields.indexOf(field) : 0;
            valueGetter = getter("[" + index + "]");
        } else if (isNumber(item)) {
            valueGetter = getter();
        } else if (typeof item === OBJECT) {
            const srcValueFields = binder.sourceFields(series, valueFields);
            valueGetter = getter(srcValueFields[valueFields.indexOf(field)]);
        }

        return valueGetter;
    }

    getErrorRange(pointValue, errorValue) {
        let low, high, value;

        if (!defined(errorValue)) {
            return null;
        }

        if (this.globalRange) {
            return this.globalRange(pointValue);
        }

        if (isArray(errorValue)) {
            low = pointValue - errorValue[0];
            high = pointValue + errorValue[1];
        } else if (isNumber(value = parseFloat(errorValue))) {
            low = pointValue - value;
            high = pointValue + value;
        } else if ((value = percentRegex.exec(errorValue))) {
            const percentValue = pointValue * (parseFloat(value[1]) / 100);
            low = pointValue - Math.abs(percentValue);
            high = pointValue + Math.abs(percentValue);
        } else {
            throw new Error("Invalid ErrorBar value: " + errorValue);
        }

        return { low: low, high: high };
    }

    getStandardError(data, average) {
        return this.getStandardDeviation(data, average, true) / Math.sqrt(average.count);
    }

    getStandardDeviation(data, average, isSample) {
        const length = data.length;
        const total = isSample ? average.count - 1 : average.count;
        let squareDifferenceSum = 0;

        for (let idx = 0; idx < length; idx++) {
            const value = this.valueGetter(data[idx]);
            if (isNumber(value)) {
                squareDifferenceSum += Math.pow(value - average.value, 2);
            }
        }

        return Math.sqrt(squareDifferenceSum / total);
    }

    getAverage(data) {
        const length = data.length;
        let sum = 0;
        let count = 0;

        for (let idx = 0; idx < length; idx++) {
            const value = this.valueGetter(data[idx]);
            if (isNumber(value)) {
                sum += value;
                count++;
            }
        }

        return {
            value: sum / count,
            count: count
        };
    }
}

export default ErrorRangeCalculator;