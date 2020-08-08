import { isNumber, isString } from '../../common';
import SeriesBinder from '../series-binder';
import segmentVisible from './segment-visible';

export default function bindSegments(series) {
    const data = series.data;
    const points = [];
    let sum = 0;
    let count = 0;

    for (let idx = 0; idx < data.length; idx++) {
        const pointData = SeriesBinder.current.bindPoint(series, idx);
        let value = pointData.valueFields.value;


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