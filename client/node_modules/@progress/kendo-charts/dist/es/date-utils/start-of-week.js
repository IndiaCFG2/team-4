import { TIME_PER_DAY } from './constants';
import addTicks from './add-ticks';

export default function startOfWeek(date, weekStartDay) {
    if ( weekStartDay === void 0 ) weekStartDay = 0;

    var daysToSubtract = 0;
    var day = date.getDay();

    if (!isNaN(day)) {
        while (day !== weekStartDay) {
            if (day === 0) {
                day = 6;
            } else {
                day--;
            }

            daysToSubtract++;
        }
    }

    return addTicks(date, -daysToSubtract * TIME_PER_DAY);
}