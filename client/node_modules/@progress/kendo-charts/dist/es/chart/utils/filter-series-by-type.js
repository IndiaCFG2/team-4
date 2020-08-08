import { inArray } from '../../common';

export default function filterSeriesByType(series, types) {
    var result = [];

    var seriesTypes = [].concat(types);
    for (var idx = 0; idx < series.length; idx++) {
        var currentSeries = series[idx];
        if (inArray(currentSeries.type, seriesTypes)) {
            result.push(currentSeries);
        }
    }

    return result;
}