import dateEquals from './date-equals';

export default function lteDateIndex(date, sortedDates) {
    var low = 0;
    var high = sortedDates.length - 1;
    var index;

    while (low <= high) {
        index = Math.floor((low + high) / 2);
        var currentDate = sortedDates[index];

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