import isArray from './is-array';

export default function addClass(element, classes) {
    const classArray = isArray(classes) ? classes : [ classes ];

    for (let idx = 0; idx < classArray.length; idx++) {
        const className = classArray[idx];
        if (element.className.indexOf(className) === -1) {
            element.className += " " + className;
        }
    }
}