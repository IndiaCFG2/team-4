import { DEFAULT_PRECISION } from '../../common/constants';
import { round } from '../../common';

export default function floor(value, step) {
    return round(Math.floor(value / step) * step, DEFAULT_PRECISION);
}
