import { inArray } from '../../common';

export default function filterSeriesByType(series, types) {
    const result = [];

    const seriesTypes = [].concat(types);
    for (let idx = 0; idx < series.length; idx++) {
        const currentSeries = series[idx];
        if (inArray(currentSeries.type, seriesTypes)) {
            result.push(currentSeries);
        }
    }

    return result;
}