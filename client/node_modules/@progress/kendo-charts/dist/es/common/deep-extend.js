import isFunction from './is-function';

var OBJECT = "object";
var UNDEFINED = "undefined";

function deepExtendOne(destination, source) {

    for (var property in source) {
        var propValue = source[property];
        var propType = typeof propValue;

        var propInit = (void 0);
        if (propType === OBJECT && propValue !== null) {
            propInit = propValue.constructor;
        } else {
            propInit = null;
        }

        if (propInit && propInit !== Array) {

            if (propValue instanceof Date) {
                destination[property] = new Date(propValue.getTime());
            } else if (isFunction(propValue.clone)) {
                destination[property] = propValue.clone();
            } else {
                var destProp = destination[property];
                if (typeof (destProp) === OBJECT) {
                    destination[property] = destProp || {};
                } else {
                    destination[property] = {};
                }
                deepExtendOne(destination[property], propValue);
            }
        } else if (propType !== UNDEFINED) {
            destination[property] = propValue;
        }
    }

    return destination;
}

export default function deepExtend(destination) {
    var arguments$1 = arguments;

    var length = arguments.length;

    for (var i = 1; i < length; i++) {
        deepExtendOne(destination, arguments$1[i]);
    }

    return destination;
}