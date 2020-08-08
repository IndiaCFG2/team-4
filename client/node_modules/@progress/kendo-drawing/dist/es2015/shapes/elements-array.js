import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';

const push = [].push;
const pop = [].pop;
const splice = [].splice;
const shift = [].shift;
const slice = [].slice;
const unshift = [].unshift;

class ElementsArray extends Class {
    constructor(array = []) {
        super();

        this.length = 0;
        this._splice(0, array.length, array);
    }

    elements(value) {
        if (value) {
            this._splice(0, this.length, value);

            this._change();
            return this;
        }

        return this.slice(0);
    }

    push() {
        const elements = arguments;
        const result = push.apply(this, elements);

        this._add(elements);

        return result;
    }

    slice() {
        return slice.call(this);
    }

    pop() {
        const length = this.length;
        const result = pop.apply(this);

        if (length) {
            this._remove([ result ]);
        }

        return result;
    }

    splice(index, howMany) {
        const elements = slice.call(arguments, 2);
        const result = this._splice(index, howMany, elements);

        this._change();

        return result;
    }

    shift() {
        const length = this.length;
        const result = shift.apply(this);

        if (length) {
            this._remove([ result ]);
        }

        return result;
    }

    unshift() {
        const elements = arguments;
        const result = unshift.apply(this, elements);

        this._add(elements);

        return result;
    }

    indexOf(element) {
        const length = this.length;

        for (let idx = 0; idx < length; idx++) {
            if (this[idx] === element) {
                return idx;
            }
        }
        return -1;
    }

    _splice(index, howMany, elements) {
        const result = splice.apply(this, [ index, howMany ].concat(elements));

        this._clearObserver(result);
        this._setObserver(elements);

        return result;
    }

    _add(elements) {
        this._setObserver(elements);
        this._change();
    }

    _remove(elements) {
        this._clearObserver(elements);
        this._change();
    }

    _setObserver(elements) {
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].addObserver(this);
        }
    }

    _clearObserver(elements) {
        for (let idx = 0; idx < elements.length; idx++) {
            elements[idx].removeObserver(this);
        }
    }

    _change() {}
}

ObserversMixin.extend(ElementsArray.prototype);

export default ElementsArray;
