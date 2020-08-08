import deepExtend from './deep-extend';

export default function setDefaultOptions(type, options) {
    var proto = type.prototype;
    if (proto.options) {
        proto.options = deepExtend({}, proto.options, options);
    } else {
        proto.options = options;
    }
}