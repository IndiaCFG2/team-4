import { drawing } from '@progress/kendo-drawing';

var FIELD_REGEX = /\[(?:(\d+)|['"](.*?)['"])\]|((?:(?!\[.*?\]|\.).)+)/g;
var getterCache = {};

getterCache['undefined'] = function(obj) {
    return obj;
};

export default function getter(field) {
    if (getterCache[field]) {
        return getterCache[field];
    }

    var fields = [];
    field.replace(FIELD_REGEX, function(match, index, indexAccessor, field) {
        fields.push(drawing.util.defined(index) ? index : (indexAccessor || field));
    });

    getterCache[field] = function(obj) {
        var result = obj;
        for (var idx = 0; idx < fields.length && result; idx++) {
            result = result[fields[idx]];
        }

        return result;
    };

    return getterCache[field];
}