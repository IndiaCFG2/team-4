import { TIME_PER_DAY } from './constants';
import addTicks from './add-ticks';

export default function startOfWeek(date, weekStartDay = 0) {
    let daysToSubtract = 0;
    let day = date.getDay();

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