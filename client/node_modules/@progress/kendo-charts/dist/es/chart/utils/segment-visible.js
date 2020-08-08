import { defined } from '../../common';

export default function segmentVisible(series, fields, index) {
    var visible = fields.visible;
    if (defined(visible)) {
        return visible;
    }

    var pointVisibility = series.pointVisibility;
    if (pointVisibility) {
        return pointVisibility[index];
    }
}

