import parseDate from './parse-date';

import { isArray } from '../common';

export default function parseDates(intlService, dates) {
    if (isArray(dates)) {
        var result = [];
        for (var idx = 0; idx < dates.length; idx++) {
            result.push(parseDate(intlService, dates[idx]));
        }

        return result;
    }

    return parseDate(intlService, dates);
}