import IntlService from './intl-service';
import { FORMAT_REGEX } from '../common/constants';
import { isString } from '../common';

const FORMAT_REPLACE_REGEX = /\{(\d+)(:[^\}]+)?\}/g;

class FormatService {
    constructor(intlService) {
        this._intlService = intlService;
    }

    get intl() {
        return this._intlService || IntlService.implementation;
    }

    set intl(value) {
        this._intlService = value;
    }

    auto(formatString, ...values) {
        const intl = this.intl;

        if (isString(formatString) && formatString.match(FORMAT_REGEX)) {
            return intl.format(formatString, ...values);
        }

        return intl.toString(values[0], formatString);
    }

    localeAuto(formatString, values, locale) {
        const intl = this.intl;
        let result;

        if (isString(formatString) && formatString.match(FORMAT_REGEX)) {
            result = formatString.replace(FORMAT_REPLACE_REGEX, function(match, index, placeholderFormat) {
                let value = values[parseInt(index, 10)];

                return intl.toString(value, placeholderFormat ? placeholderFormat.substring(1) : "", locale);
            });
        } else {
            result = intl.toString(values[0], formatString, locale);
        }

        return result;
    }
}

export default FormatService;