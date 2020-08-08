import { drawing } from '@progress/kendo-drawing';
import { COORD_PRECISION } from './constants';

export default function interpolateValue(start, end, progress) {
    return drawing.util.round(start + (end - start) * progress, COORD_PRECISION);
}