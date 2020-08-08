import { inArray, isFunction, isObject, valueOrDefault } from '../../common';

var MAX_EXPAND_DEPTH = 5;

export default function evalOptions(options, context, state, dryRun) {
    if ( state === void 0 ) state = {};
    if ( dryRun === void 0 ) dryRun = false;

    var defaults = state.defaults = state.defaults || {};
    var depth = state.depth = state.depth || 0;
    var needsEval = false;

    state.excluded = state.excluded || [];

    if (depth > MAX_EXPAND_DEPTH) {
        return null;
    }

    for (var property in options) {
        if (!inArray(property, state.excluded) && options.hasOwnProperty(property)) {
            var propValue = options[property];
            if (isFunction(propValue)) {
                needsEval = true;
                if (!dryRun) {
                    options[property] = valueOrDefault(propValue(context), defaults[property]);
                }
            } else if (isObject(propValue)) {
                if (!dryRun) {
                    state.defaults = defaults[property];
                }
                state.depth++;
                needsEval = evalOptions(propValue, context, state, dryRun) || needsEval;
                state.depth--;
            }
        }
    }

    return needsEval;
}