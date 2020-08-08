let current;

class DomEventsBuilder {
    static register(userImplementation) {
        current = userImplementation;
    }

    static create(element, events) {
        if (current) {
            return current.create(element, events);
        }
    }
}

export default DomEventsBuilder;
