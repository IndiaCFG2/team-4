import addDuration from './add-duration';
import toDate from './to-date';

export default function floorDate(date, unit, weekStartDay) {
    return addDuration(toDate(date), 0, unit, weekStartDay);
}