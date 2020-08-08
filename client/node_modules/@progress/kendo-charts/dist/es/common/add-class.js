import isArray from './is-array';

export default function addClass(element, classes) {
    var classArray = isArray(classes) ? classes : [ classes ];

    for (var idx = 0; idx < classArray.length; idx++) {
        var className = classArray[idx];
        if (element.className.indexOf(className) === -1) {
            element.className += " " + className;
        }
    }
}