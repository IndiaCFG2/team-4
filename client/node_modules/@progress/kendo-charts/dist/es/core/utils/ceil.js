import { DEFAULT_PRECISION } from '../../common/constants';
import { round } from '../../common';

export default function ceil(value, step) {
    return round(Math.ceil(value / step) * step, DEFAULT_PRECISION);
}