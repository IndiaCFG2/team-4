import { TIME_PER_MINUTE } from './constants';

export default function absoluteDateDiff(a, b) {
    var diff = a.getTime() - b;
    var offsetDiff = a.getTimezoneOffset() - b.getTimezoneOffset();

    return diff - (offsetDiff * TIME_PER_MINUTE);
}