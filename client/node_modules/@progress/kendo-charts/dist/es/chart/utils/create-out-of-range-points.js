import { INTERPOLATE, ZERO } from '../constants';
import { convertableToNumber } from '../../common';
import SeriesBinder from '../series-binder';

var AREA_REGEX = /area/i;

function seriesMissingValues(series) {
    if (series.missingValues) {
        return series.missingValues;
    }

    return AREA_REGEX.test(series.type) || series.stack ? ZERO : INTERPOLATE;
}

function hasValue(series, item) {
    var fields = SeriesBinder.current.bindPoint(series, null, item);
    var valueFields = fields.valueFields;

    for (var field in valueFields) {
        if (convertableToNumber(valueFields[field])) {
            return true;
        }
    }
}

function findNext(ref) {
    var start = ref.start;
    var dir = ref.dir;
    var min = ref.min;
    var max = ref.max;
    var getter = ref.getter;
    var hasItem = ref.hasItem;
    var series = ref.series;

    var pointHasValue, outPoint;
    var idx = start;
    do {
        idx += dir;
        //aggregating and binding the item takes too much time for large number of categories
        //will assume that if the aggregation does not create value for a missing item for one it will not create for others
        if (hasItem(idx)) {
            outPoint = getter(idx);
            pointHasValue = hasValue(series, outPoint.item);
        }
    } while (min <= idx && idx <= max && !pointHasValue);

    if (pointHasValue) {
        return outPoint;
    }
}

export default function createOutOfRangePoints(series, range, count, getter, hasItem) {
    var min = range.min;
    var max = range.max;
    var hasMinPoint = min > 0 && min < count;
    var hasMaxPoint = max + 1 < count;

    if (hasMinPoint || hasMaxPoint) {
        var missingValues = seriesMissingValues(series);
        var minPoint, maxPoint;
        if (missingValues !== INTERPOLATE) {
            if (hasMinPoint) {
                minPoint = getter(min - 1);
            }

            if (hasMaxPoint) {
                maxPoint = getter(max + 1);
            }
        } else {
            var outPoint, pointHasValue;
            if (hasMinPoint) {
                outPoint = getter(min - 1);
                pointHasValue = hasValue(series, outPoint.item);
                if (!pointHasValue) {
                    minPoint = findNext({
                        start: min,
                        dir: -1,
                        min: 0,
                        max: count - 1,
                        getter: getter,
                        hasItem: hasItem,
                        series: series
                    });
                } else {
                    minPoint = outPoint;
                }
            }

            if (hasMaxPoint) {
                outPoint = getter(max + 1);
                pointHasValue = hasValue(series, outPoint.item);
                if (!pointHasValue) {
                    maxPoint = findNext({
                        start: max,
                        dir: 1,
                        min: 0,
                        max: count - 1,
                        getter: getter,
                        hasItem: hasItem,
                        series: series
                    });
                } else {
                    maxPoint = outPoint;
                }
            }
        }

        if (minPoint) {
            series._outOfRangeMinPoint = minPoint;
        }

        if (maxPoint) {
            series._outOfRangeMaxPoint = maxPoint;
        }
    }
}