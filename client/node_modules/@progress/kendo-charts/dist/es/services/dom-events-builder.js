var current;

var DomEventsBuilder = function DomEventsBuilder () {};

DomEventsBuilder.register = function register (userImplementation) {
    current = userImplementation;
};

DomEventsBuilder.create = function create (element, events) {
    if (current) {
        return current.create(element, events);
    }
};

export default DomEventsBuilder;
