import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { defined, isNumber } from '../../common';

import countNumbers from '../utils/count-numbers';

const Aggregates = {
    min: function(values) {
        const length = values.length;
        let min = MAX_VALUE;

        for (let i = 0; i < length; i++) {
            const value = values[i];
            if (isNumber(value)) {
                min = Math.min(min, value);
            }
        }

        return min === MAX_VALUE ? values[0] : min;
    },

    max: function(values) {
        const length = values.length;
        let max = MIN_VALUE;

        for (let i = 0; i < length; i++) {
            const value = values[i];
            if (isNumber(value)) {
                max = Math.max(max, value);
            }
        }

        return max === MIN_VALUE ? values[0] : max;
    },

    sum: function(values) {
        const length = values.length;
        let sum = 0;

        for (let i = 0; i < length; i++) {
            const value = values[i];
            if (isNumber(value)) {
                sum += value;
            }
        }

        return sum;
    },

    sumOrNull: function(values) {
        let result = null;

        if (countNumbers(values)) {
            result = Aggregates.sum(values);
        }

        return result;
    },

    count: function(values) {
        const length = values.length;
        let count = 0;

        for (let i = 0; i < length; i++) {
            const value = values[i];
            if (value !== null && defined(value)) {
                count++;
            }
        }

        return count;
    },

    avg: function(values) {
        const count = countNumbers(values);
        let result = values[0];

        if (count > 0) {
            result = Aggregates.sum(values) / count;
        }

        return result;
    },

    first: function(values) {
        const length = values.length;

        for (let i = 0; i < length; i++) {
            const value = values[i];
            if (value !== null && defined(value)) {
                return value;
            }
        }

        return values[0];
    }
};

export default Aggregates;