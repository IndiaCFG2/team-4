import { defined } from '../../common';
import { MIN_VALUE, MAX_VALUE } from '../../common/constants';

export default function getRange(range, min, max) {
    var from = defined(range.from) ? range.from : MIN_VALUE;
    var to = defined(range.to) ? range.to : MAX_VALUE;

    range.from = Math.max(Math.min(to, from), min);
    range.to = Math.min(Math.max(to, from), max);

    return range;
}