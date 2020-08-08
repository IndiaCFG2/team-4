import { drawing } from '@progress/kendo-drawing';

const FIELD_REGEX = /\[(?:(\d+)|['"](.*?)['"])\]|((?:(?!\[.*?\]|\.).)+)/g;
const getterCache = {};

getterCache['undefined'] = function(obj) {
    return obj;
};

export default function getter(field) {
    if (getterCache[field]) {
        return getterCache[field];
    }

    const fields = [];
    field.replace(FIELD_REGEX, function(match, index, indexAccessor, field) {
        fields.push(drawing.util.defined(index) ? index : (indexAccessor || field));
    });

    getterCache[field] = function(obj) {
        let result = obj;
        for (let idx = 0; idx < fields.length && result; idx++) {
            result = result[fields[idx]];
        }

        return result;
    };

    return getterCache[field];
}