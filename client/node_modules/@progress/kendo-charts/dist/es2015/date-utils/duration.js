import { DAYS, MONTHS, YEARS, TIME_PER_DAY, TIME_PER_UNIT } from './constants';
import dateDiff from './date-diff';

export default function duration(a, b, unit) {
    let diff;

    if (unit === YEARS) {
        diff = b.getFullYear() - a.getFullYear();
    } else if (unit === MONTHS) {
        diff = duration(a, b, YEARS) * 12 + b.getMonth() - a.getMonth();
    } else if (unit === DAYS) {
        diff = Math.floor(dateDiff(b, a) / TIME_PER_DAY);
    } else {
        diff = Math.floor(dateDiff(b, a) / TIME_PER_UNIT[unit]);
    }

    return diff;
}