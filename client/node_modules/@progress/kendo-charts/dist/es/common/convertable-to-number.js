import isNumber from './is-number';
import isString from './is-string';

export default function convertableToNumber(value) {
    return isNumber(value) || (isString(value) && isFinite(value));
}