import { defined } from '../../common';

export default function segmentVisible(series, fields, index) {
    const visible = fields.visible;
    if (defined(visible)) {
        return visible;
    }

    const pointVisibility = series.pointVisibility;
    if (pointVisibility) {
        return pointVisibility[index];
    }
}

