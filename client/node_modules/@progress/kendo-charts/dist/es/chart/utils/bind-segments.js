import { isNumber, isString } from '../../common';
import SeriesBinder from '../series-binder';
import segmentVisible from './segment-visible';

export default function bindSegments(series) {
    var data = series.data;
    var points = [];
    var sum = 0;
    var count = 0;

    for (var idx = 0; idx < data.length; idx++) {
        var pointData = SeriesBinder.current.bindPoint(series, idx);
        var value = pointData.valueFields.value;


        if (isString(value)) {
            value = parseFloat(value);
        }

        if (isNumber(value)) {
            pointData.visible = segmentVisible(series, pointData.fields, idx) !== false;

            pointData.value = Math.abs(value);
            points.push(pointData);

            if (pointData.visible) {
                sum += pointData.value;
            }

            if (value !== 0) {
                count++;
            }
        } else {
            points.push(null);
        }
    }

    return {
        total: sum,
        points: points,
        count: count
    };
}