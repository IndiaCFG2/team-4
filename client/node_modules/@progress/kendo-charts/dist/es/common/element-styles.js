import isObject from './is-object';
import isArray from './is-array';
import isString from './is-string';
import styleValue from './style-value';

var SIZE_STYLES_REGEX = /width|height|top|left|bottom|right/i;

function isSizeField(field) {
    return SIZE_STYLES_REGEX.test(field);
}

export default function elementStyles(element, styles) {
    var stylesArray = isString(styles) ? [ styles ] : styles;

    if (isArray(stylesArray)) {
        var result = {};
        var style = window.getComputedStyle(element);

        for (var idx = 0; idx < stylesArray.length; idx++) {
            var field = stylesArray[idx];
            result[field] = isSizeField(field) ? parseFloat(style[field]) : style[field];
        }

        return result;
    } else if (isObject(styles)) {
        for (var field$1 in styles) {
            element.style[field$1] = styleValue(styles[field$1]);
        }
    }
}