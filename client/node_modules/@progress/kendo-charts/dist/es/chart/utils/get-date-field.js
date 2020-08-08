import { parseDate } from '../../date-utils';
import { getter } from '../../common';

export default function getDateField(field, row, intlService) {
    if (row === null) {
        return row;
    }

    var key = "_date_" + field;
    var value = row[key];

    if (!value) {
        value = parseDate(intlService, getter(field, true)(row));
        row[key] = value;
    }

    return value;
}