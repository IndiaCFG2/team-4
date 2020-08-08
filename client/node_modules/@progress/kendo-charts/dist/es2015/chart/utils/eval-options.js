import { inArray, isFunction, isObject, valueOrDefault } from '../../common';

const MAX_EXPAND_DEPTH = 5;

export default function evalOptions(options, context, state = {}, dryRun = false) {
    const defaults = state.defaults = state.defaults || {};
    const depth = state.depth = state.depth || 0;
    let needsEval = false;

    state.excluded = state.excluded || [];

    if (depth > MAX_EXPAND_DEPTH) {
        return null;
    }

    for (let property in options) {
        if (!inArray(property, state.excluded) && options.hasOwnProperty(property)) {
            const propValue = options[property];
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