import { getter } from '../../common';

export default function getField(field, row) {
    if (row === null) {
        return row;
    }

    const get = getter(field, true);
    return get(row);
}