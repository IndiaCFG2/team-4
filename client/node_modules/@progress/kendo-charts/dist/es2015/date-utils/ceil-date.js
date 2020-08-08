import floorDate from './floor-date';
import addDuration from './add-duration';
import toDate from './to-date';

export default function ceilDate(dateValue, unit, weekStartDay) {
    const date = toDate(dateValue);

    if (date && floorDate(date, unit, weekStartDay).getTime() === date.getTime()) {
        return date;
    }

    return addDuration(date, 1, unit, weekStartDay);
}