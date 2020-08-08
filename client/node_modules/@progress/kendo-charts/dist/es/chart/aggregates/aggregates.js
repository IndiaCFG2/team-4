import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { defined, isNumber } from '../../common';

import countNumbers from '../utils/count-numbers';

var Aggregates = {
    min: function(values) {
        var length = values.length;
        var min = MAX_VALUE;

        for (var i = 0; i < length; i++) {
            var value = values[i];
            if (isNumber(value)) {
                min = Math.min(min, value);
            }
        }

        return min === MAX_VALUE ? values[0] : min;
    },

    max: function(values) {
        var length = values.length;
        var max = MIN_VALUE;

        for (var i = 0; i < length; i++) {
            var value = values[i];
            if (isNumber(value)) {
                max = Math.max(max, value);
            }
        }

        return max === MIN_VALUE ? values[0] : max;
    },

    sum: function(values) {
        var length = values.length;
        var sum = 0;

        for (var i = 0; i < length; i++) {
            var value = values[i];
            if (isNumber(value)) {
                sum += value;
            }
        }

        return sum;
    },

    sumOrNull: function(values) {
        var result = null;

        if (countNumbers(values)) {
            result = Aggregates.sum(values);
        }

        return result;
    },

    count: function(values) {
        var length = values.length;
        var count = 0;

        for (var i = 0; i < length; i++) {
            var value = values[i];
            if (value !== null && defined(value)) {
                count++;
            }
        }

        return count;
    },

    avg: function(values) {
        var count = countNumbers(values);
        var result = values[0];

        if (count > 0) {
            result = Aggregates.sum(values) / count;
        }

        return result;
    },

    first: function(values) {
        var length = values.length;

        for (var i = 0; i < length; i++) {
            var value = values[i];
            if (value !== null && defined(value)) {
                return value;
            }
        }

        return values[0];
    }
};

export default Aggregates;