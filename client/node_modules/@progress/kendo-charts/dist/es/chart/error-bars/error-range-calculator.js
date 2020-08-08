import SeriesBinder from '../series-binder';

import { OBJECT } from '../../common/constants';
import { Class, defined, getter, isArray, isNumber } from '../../common';

var STD_ERR = "stderr";
var STD_DEV = "stddev";
var percentRegex = /percent(?:\w*)\((\d+)\)/;
var standardDeviationRegex = new RegExp("^" + STD_DEV + "(?:\\((\\d+(?:\\.\\d+)?)\\))?$");

var ErrorRangeCalculator = (function (Class) {
    function ErrorRangeCalculator(errorValue, series, field) {
        Class.call(this);

        this.initGlobalRanges(errorValue, series, field);
    }

    if ( Class ) ErrorRangeCalculator.__proto__ = Class;
    ErrorRangeCalculator.prototype = Object.create( Class && Class.prototype );
    ErrorRangeCalculator.prototype.constructor = ErrorRangeCalculator;

    ErrorRangeCalculator.prototype.initGlobalRanges = function initGlobalRanges (errorValue, series, field) {
        var data = series.data;
        var deviationMatch = standardDeviationRegex.exec(errorValue);

        if (deviationMatch) {
            this.valueGetter = this.createValueGetter(series, field);

            var average = this.getAverage(data);
            var deviation = this.getStandardDeviation(data, average, false);
            var multiple = deviationMatch[1] ? parseFloat(deviationMatch[1]) : 1;
            var errorRange = { low: average.value - deviation * multiple, high: average.value + deviation * multiple };

            this.globalRange = function() {
                return errorRange;
            };
        } else if (errorValue.indexOf && errorValue.indexOf(STD_ERR) >= 0) {
            this.valueGetter = this.createValueGetter(series, field);
            var standardError = this.getStandardError(data, this.getAverage(data));

            this.globalRange = function(value) {
                return { low: value - standardError, high: value + standardError };
            };
        }
    };

    ErrorRangeCalculator.prototype.createValueGetter = function createValueGetter (series, field) {
        var data = series.data;
        var binder = SeriesBinder.current;
        var valueFields = binder.valueFields(series);
        var item = defined(data[0]) ? data[0] : {};
        var valueGetter;

        if (isArray(item)) {
            var index = field ? valueFields.indexOf(field) : 0;
            valueGetter = getter("[" + index + "]");
        } else if (isNumber(item)) {
            valueGetter = getter();
        } else if (typeof item === OBJECT) {
            var srcValueFields = binder.sourceFields(series, valueFields);
            valueGetter = getter(srcValueFields[valueFields.indexOf(field)]);
        }

        return valueGetter;
    };

    ErrorRangeCalculator.prototype.getErrorRange = function getErrorRange (pointValue, errorValue) {
        var low, high, value;

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
            var percentValue = pointValue * (parseFloat(value[1]) / 100);
            low = pointValue - Math.abs(percentValue);
            high = pointValue + Math.abs(percentValue);
        } else {
            throw new Error("Invalid ErrorBar value: " + errorValue);
        }

        return { low: low, high: high };
    };

    ErrorRangeCalculator.prototype.getStandardError = function getStandardError (data, average) {
        return this.getStandardDeviation(data, average, true) / Math.sqrt(average.count);
    };

    ErrorRangeCalculator.prototype.getStandardDeviation = function getStandardDeviation (data, average, isSample) {
        var this$1 = this;

        var length = data.length;
        var total = isSample ? average.count - 1 : average.count;
        var squareDifferenceSum = 0;

        for (var idx = 0; idx < length; idx++) {
            var value = this$1.valueGetter(data[idx]);
            if (isNumber(value)) {
                squareDifferenceSum += Math.pow(value - average.value, 2);
            }
        }

        return Math.sqrt(squareDifferenceSum / total);
    };

    ErrorRangeCalculator.prototype.getAverage = function getAverage (data) {
        var this$1 = this;

        var length = data.length;
        var sum = 0;
        var count = 0;

        for (var idx = 0; idx < length; idx++) {
            var value = this$1.valueGetter(data[idx]);
            if (isNumber(value)) {
                sum += value;
                count++;
            }
        }

        return {
            value: sum / count,
            count: count
        };
    };

    return ErrorRangeCalculator;
}(Class));

export default ErrorRangeCalculator;