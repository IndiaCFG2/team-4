import isObject from './is-object';
import isArray from './is-array';
import isString from './is-string';
import styleValue from './style-value';

const SIZE_STYLES_REGEX = /width|height|top|left|bottom|right/i;

function isSizeField(field) {
    return SIZE_STYLES_REGEX.test(field);
}

export default function elementStyles(element, styles) {
    const stylesArray = isString(styles) ? [ styles ] : styles;

    if (isArray(stylesArray)) {
        const result = {};
        const style = window.getComputedStyle(element);

        for (let idx = 0; idx < stylesArray.length; idx++) {
            let field = stylesArray[idx];
            result[field] = isSizeField(field) ? parseFloat(style[field]) : style[field];
        }

        return result;
    } else if (isObject(styles)) {
        for (let field in styles) {
            element.style[field] = styleValue(styles[field]);
        }
    }
}