import Class from './class';

class Observable extends Class {
    constructor() {
        super();

        this._events = {};
    }

    bind(eventName, handlers, one) {
        const eventNames = getArray(eventName);
        const handlersIsFunction = isFunction(handlers);
        const length = eventNames.length;

        if (handlers === undefined) {
            for (let field in eventName) {
                this.bind(field, eventName[field]);
            }
            return this;
        }

        for (let idx = 0; idx < length; idx++) {
            const eventName = eventNames[idx];

            let handler = handlersIsFunction ? handlers : handlers[eventName];

            if (handler) {
                if (one) {
                    const original = handler;
                    handler = () => { // eslint-disable-line no-loop-func
                        this.unbind(eventName, handler);
                        original.apply(this, arguments);
                    };
                    handler.original = original;
                }
                let events = this._events[eventName] = this._events[eventName] || [];
                events.push(handler);
            }
        }

        return this;
    }

    one(eventNames, handlers) {
        return this.bind(eventNames, handlers, true);
    }

    first(eventName, handlers) {
        const eventNames = getArray(eventName);
        const handlersIsFunction = isFunction(handlers);

        for (let idx = 0, length = eventNames.length; idx < length; idx++) {
            const eventName = eventNames[idx];

            const handler = handlersIsFunction ? handlers : handlers[eventName];

            if (handler) {
                const events = this._events[eventName] = this._events[eventName] || [];
                events.unshift(handler);
            }
        }

        return this;
    }

    trigger(eventName, e = {}) {
        let events = this._events[eventName];

        if (events) {
            const length = events.length;

            e.sender = this;
            e._defaultPrevented = false;
            e.preventDefault = preventDefault;
            e.isDefaultPrevented = isDefaultPrevented;

            events = events.slice();

            for (let idx = 0; idx < length; idx++) {
                events[idx].call(this, e);
            }

            return e._defaultPrevented === true;
        }

        return false;
    }

    unbind(eventName, handler) {
        const events = this._events[eventName];

        if (eventName === undefined) {
            this._events = {};
        } else if (events) {
            if (handler) {
                for (let idx = events.length - 1; idx >= 0; idx--) {
                    if (events[idx] === handler || events[idx].original === handler) {
                        events.splice(idx, 1);
                    }
                }
            } else {
                this._events[eventName] = [];
            }
        }

        return this;
    }
}

function isFunction(value) {
    return typeof value === "function";
}

function getArray(value) {
    return typeof value === "string" ? [ value ] : value;
}

function preventDefault() {
    this._defaultPrevented = true;
}

function isDefaultPrevented() {
    return this._defaultPrevented === true;
}

export default Observable;