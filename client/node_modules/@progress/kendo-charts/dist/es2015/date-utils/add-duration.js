import { MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS, WEEKS, MONTHS, YEARS,
    TIME_PER_SECOND, TIME_PER_MINUTE, TIME_PER_HOUR } from './constants';
import addTicks from './add-ticks';
import toDate from './to-date';
import startOfWeek from './start-of-week';

function adjustDST(date, hours) {
    if (hours === 0 && date.getHours() === 23) {
        date.setHours(date.getHours() + 2);
        return true;
    }

    return false;
}

function addHours(date, hours) {
    const roundedDate = new Date(date);

    roundedDate.setMinutes(0, 0, 0);

    const tzDiff = (date.getTimezoneOffset() - roundedDate.getTimezoneOffset()) * TIME_PER_MINUTE;

    return addTicks(roundedDate, tzDiff + hours * TIME_PER_HOUR);
}

export default function addDuration(dateValue, value, unit, weekStartDay) {
    let result = dateValue;

    if (dateValue) {
        let date = toDate(dateValue);
        const hours = date.getHours();

        if (unit === YEARS) {
            result = new Date(date.getFullYear() + value, 0, 1);
            adjustDST(result, 0);
        } else if (unit === MONTHS) {
            result = new Date(date.getFullYear(), date.getMonth() + value, 1);
            adjustDST(result, hours);
        } else if (unit === WEEKS) {
            result = addDuration(startOfWeek(date, weekStartDay), value * 7, DAYS);
            adjustDST(result, hours);
        } else if (unit === DAYS) {
            result = new Date(date.getFullYear(), date.getMonth(), date.getDate() + value);
            adjustDST(result, hours);
        } else if (unit === HOURS) {
            result = addHours(date, value);
        } else if (unit === MINUTES) {
            result = addTicks(date, value * TIME_PER_MINUTE);

            if (result.getSeconds() > 0) {
                result.setSeconds(0);
            }
        } else if (unit === SECONDS) {
            result = addTicks(date, value * TIME_PER_SECOND);
        } else if (unit === MILLISECONDS) {
            result = addTicks(date, value);
        }

        if (unit !== MILLISECONDS && result.getMilliseconds() > 0) {
            result.setMilliseconds(0);
        }
    }

    return result;
}