import { PRECISION } from '../constants';

import { round } from '../../util';

export default function close(a, b, tolerance = PRECISION) {
    return round(Math.abs(a - b), tolerance) === 0;
}