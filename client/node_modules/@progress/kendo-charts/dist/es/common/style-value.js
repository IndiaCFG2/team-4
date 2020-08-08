import isNumber from './is-number';

export default function styleValue(value) {
    if (isNumber(value)) {
        return value + "px";
    }
    return value;
}