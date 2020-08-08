export default function elementStyles(element, styles) {
    const result = {};
    const style = window.getComputedStyle(element) || {};
    const stylesArray = Array.isArray(styles) ? styles : [ styles ];

    for (let idx = 0; idx < stylesArray.length; idx++) {
        let field = stylesArray[idx];
        result[field] = style[field];
    }

    return result;
}