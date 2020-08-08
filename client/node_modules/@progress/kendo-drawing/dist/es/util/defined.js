var UNDEFINED = "undefined";

export default function defined(value) {
    return typeof value !== UNDEFINED;
}