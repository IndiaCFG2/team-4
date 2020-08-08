const defaultImplementation = {
    format: (format, value) => value,

    toString: (value) => value,

    parseDate: (value) => new Date(value)
};

let current = defaultImplementation;

class IntlService {
    static register(userImplementation) {
        current = userImplementation;
    }

    static get implementation() {
        return current;
    }
}

export default IntlService;
