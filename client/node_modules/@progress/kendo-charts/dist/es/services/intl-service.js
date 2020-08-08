var defaultImplementation = {
    format: function (format, value) { return value; },

    toString: function (value) { return value; },

    parseDate: function (value) { return new Date(value); }
};

var current = defaultImplementation;

var IntlService = function IntlService () {};

var staticAccessors = { implementation: { configurable: true } };

IntlService.register = function register (userImplementation) {
    current = userImplementation;
};

staticAccessors.implementation.get = function () {
    return current;
};

Object.defineProperties( IntlService, staticAccessors );

export default IntlService;
