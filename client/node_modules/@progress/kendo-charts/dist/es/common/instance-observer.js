import deepExtend from './deep-extend';

var TRIGGER = 'trigger';

var InstanceObserver = function InstanceObserver(observer, handlers) {
    this.observer = observer;
    this.handlerMap = deepExtend({}, this.handlerMap, handlers);
};

InstanceObserver.prototype.trigger = function trigger (name, args) {
    var ref = this;
        var observer = ref.observer;
        var handlerMap = ref.handlerMap;
    var isDefaultPrevented;
    if (handlerMap[name]) {
        isDefaultPrevented = this.callObserver(handlerMap[name], args);
    } else if (observer[TRIGGER]) {
        isDefaultPrevented = this.callObserver(TRIGGER, name, args);
    }

    return isDefaultPrevented;
};

InstanceObserver.prototype.callObserver = function callObserver (fnName) {
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    return this.observer[fnName].apply(this.observer, args);
};

InstanceObserver.prototype.requiresHandlers = function requiresHandlers (names) {
        var this$1 = this;

    if (this.observer.requiresHandlers) {
        return this.observer.requiresHandlers(names);
    }

    for (var idx = 0; idx < names.length; idx++) {
        if (this$1.handlerMap[names[idx]]) {
            return true;
        }
    }
};

export default InstanceObserver;