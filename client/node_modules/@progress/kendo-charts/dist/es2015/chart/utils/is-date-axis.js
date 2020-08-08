import equalsIgnoreCase from './equals-ignore-case';

import { DATE } from '../../common/constants';

export default function isDateAxis(axisOptions, sampleCategory) {
    const type = axisOptions.type;
    const dateCategory = sampleCategory instanceof Date;

    return (!type && dateCategory) || equalsIgnoreCase(type, DATE);
}