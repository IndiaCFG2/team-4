import isFunction from './is-function';

const OBJECT = "object";
const UNDEFINED = "undefined";

function deepExtendOne(destination, source) {

    for (let property in source) {
        let propValue = source[property];
        let propType = typeof propValue;

        let propInit;
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
                let destProp = destination[property];
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
    const length = arguments.length;

    for (let i = 1; i < length; i++) {
        deepExtendOne(destination, arguments[i]);
    }

    return destination;
}