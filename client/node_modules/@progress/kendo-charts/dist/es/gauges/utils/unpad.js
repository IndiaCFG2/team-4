import { getSpacing } from '../../common';
import pad from './pad';

export default function unpad(bbox, value) {
    var spacing = getSpacing(value);

    spacing.left = -spacing.left; spacing.top = -spacing.top;
    spacing.right = -spacing.right; spacing.bottom = -spacing.bottom;

    return pad(bbox, spacing);
}