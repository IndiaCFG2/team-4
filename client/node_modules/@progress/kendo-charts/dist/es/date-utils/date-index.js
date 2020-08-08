import { DAYS, WEEKS, MONTHS, YEARS, TIME_PER_UNIT } from './constants';
import dateDiff from './date-diff';
import absoluteDateDiff from './absolute-date-diff';
import toDate from './to-date';

function timeIndex(date, start, baseUnit) {
    return absoluteDateDiff(date, start) / TIME_PER_UNIT[baseUnit];
}

export default function dateIndex(value, start, baseUnit, baseUnitStep) {
    var date = toDate(value);
    var startDate = toDate(start);
    var index;

    if (baseUnit === MONTHS) {
        index = (date.getMonth() - startDate.getMonth() + (date.getFullYear() - startDate.getFullYear()) * 12) +
            timeIndex(date, new Date(date.getFullYear(), date.getMonth()), DAYS) / new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    } else if (baseUnit === YEARS) {
        index = date.getFullYear() - startDate.getFullYear() + dateIndex(date, new Date(date.getFullYear(), 0), MONTHS, 1) / 12;
    } else if (baseUnit === DAYS || baseUnit === WEEKS) {
        index = timeIndex(date, startDate, baseUnit);
    } else {
        index = dateDiff(date, start) / TIME_PER_UNIT[baseUnit];
    }

    return index / baseUnitStep;
}

