import ObserversMixin from '../mixins/observers-mixin';
import { Class } from '../common';
import { defined } from '../util';

const toString = {}.toString;

class OptionsStore extends Class {

    constructor(options, prefix = "") {
        super();

        this.prefix = prefix;

        for (let field in options) {
            let member = options[field];
            member = this._wrap(member, field);
            this[field] = member;
        }
    }

    get(field) {
        const parts = field.split(".");
        let result = this;

        while (parts.length && result) {
            let part = parts.shift();
            result = result[part];
        }

        return result;
    }

    set(field, value) {
        const current = this.get(field);

        if (current !== value) {
            this._set(field, this._wrap(value, field));
            this.optionsChange({
                field: this.prefix + field,
                value: value
            });
        }
    }

    _set(field, value) {
        const composite = field.indexOf(".") >= 0;
        let parentObj = this;
        let fieldName = field;

        if (composite) {
            const parts = fieldName.split(".");
            let prefix = this.prefix;

            while (parts.length > 1) {
                fieldName = parts.shift();
                prefix += fieldName + ".";

                let obj = parentObj[fieldName];

                if (!obj) {
                    obj = new OptionsStore({}, prefix);
                    obj.addObserver(this);
                    parentObj[fieldName] = obj;
                }
                parentObj = obj;
            }
            fieldName = parts[0];
        }

        parentObj._clear(fieldName);
        parentObj[fieldName] = value;
    }

    _clear(field) {
        const current = this[field];
        if (current && current.removeObserver) {
            current.removeObserver(this);
        }
    }

    _wrap(object, field) {
        const type = toString.call(object);
        let wrapped = object;

        if (wrapped !== null && defined(wrapped) && type === "[object Object]") {
            if (!(object instanceof OptionsStore) && !(object instanceof Class)) {
                wrapped = new OptionsStore(wrapped, this.prefix + field + ".");
            }

            wrapped.addObserver(this);
        }

        return wrapped;
    }
}

ObserversMixin.extend(OptionsStore.prototype);

export default OptionsStore;