import IntlService from './intl-service';
import { FORMAT_REGEX } from '../common/constants';
import { isString } from '../common';

var FORMAT_REPLACE_REGEX = /\{(\d+)(:[^\}]+)?\}/g;

var FormatService = function FormatService(intlService) {
    this._intlService = intlService;
};

var prototypeAccessors = { intl: { configurable: true } };

prototypeAccessors.intl.get = function () {
    return this._intlService || IntlService.implementation;
};

prototypeAccessors.intl.set = function (value) {
    this._intlService = value;
};

FormatService.prototype.auto = function auto (formatString) {
        var values = [], len = arguments.length - 1;
        while ( len-- > 0 ) values[ len ] = arguments[ len + 1 ];

    var intl = this.intl;

    if (isString(formatString) && formatString.match(FORMAT_REGEX)) {
        return intl.format.apply(intl, [ formatString ].concat( values ));
    }

    return intl.toString(values[0], formatString);
};

FormatService.prototype.localeAuto = function localeAuto (formatString, values, locale) {
    var intl = this.intl;
    var result;

    if (isString(formatString) && formatString.match(FORMAT_REGEX)) {
        result = formatString.replace(FORMAT_REPLACE_REGEX, function(match, index, placeholderFormat) {
            var value = values[parseInt(index, 10)];

            return intl.toString(value, placeholderFormat ? placeholderFormat.substring(1) : "", locale);
        });
    } else {
        result = intl.toString(values[0], formatString, locale);
    }

    return result;
};

Object.defineProperties( FormatService.prototype, prototypeAccessors );

export default FormatService;