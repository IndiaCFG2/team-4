import dateEquals from './date-equals';

export default function lteDateIndex(date, sortedDates) {
    let low = 0;
    let high = sortedDates.length - 1;
    let index;

    while (low <= high) {
        index = Math.floor((low + high) / 2);
        const currentDate = sortedDates[index];

        if (currentDate < date) {
            low = index + 1;
            continue;
        }

        if (currentDate > date) {
            high = index - 1;
            continue;
        }

        while (dateEquals(sortedDates[index - 1], date)) {
            index--;
        }

        return index;
    }

    if (sortedDates[index] <= date) {
        return index;
    }

    return index - 1;
}