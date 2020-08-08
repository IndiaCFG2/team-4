import deepExtend from './deep-extend';

const TRIGGER = 'trigger';

class InstanceObserver {
    constructor(observer, handlers) {
        this.observer = observer;
        this.handlerMap = deepExtend({}, this.handlerMap, handlers);
    }

    trigger(name, args) {
        const { observer, handlerMap } = this;
        let isDefaultPrevented;
        if (handlerMap[name]) {
            isDefaultPrevented = this.callObserver(handlerMap[name], args);
        } else if (observer[TRIGGER]) {
            isDefaultPrevented = this.callObserver(TRIGGER, name, args);
        }

        return isDefaultPrevented;
    }

    callObserver(fnName, ...args) {
        return this.observer[fnName].apply(this.observer, args);
    }

    requiresHandlers(names) {
        if (this.observer.requiresHandlers) {
            return this.observer.requiresHandlers(names);
        }

        for (let idx = 0; idx < names.length; idx++) {
            if (this.handlerMap[names[idx]]) {
                return true;
            }
        }
    }
}

export default InstanceObserver;