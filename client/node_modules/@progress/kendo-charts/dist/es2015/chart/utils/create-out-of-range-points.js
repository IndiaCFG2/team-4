import { INTERPOLATE, ZERO } from '../constants';
import { convertableToNumber } from '../../common';
import SeriesBinder from '../series-binder';

const AREA_REGEX = /area/i;

function seriesMissingValues(series) {
    if (series.missingValues) {
        return series.missingValues;
    }

    return AREA_REGEX.test(series.type) || series.stack ? ZERO : INTERPOLATE;
}

function hasValue(series, item) {
    const fields = SeriesBinder.current.bindPoint(series, null, item);
    const valueFields = fields.valueFields;

    for (let field in valueFields) {
        if (convertableToNumber(valueFields[field])) {
            return true;
        }
    }
}

function findNext({ start, dir, min, max, getter, hasItem, series }) {
    let pointHasValue, outPoint;
    let idx = start;
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
    const { min, max } = range;
    const hasMinPoint = min > 0 && min < count;
    const hasMaxPoint = max + 1 < count;

    if (hasMinPoint || hasMaxPoint) {
        const missingValues = seriesMissingValues(series);
        let minPoint, maxPoint;
        if (missingValues !== INTERPOLATE) {
            if (hasMinPoint) {
                minPoint = getter(min - 1);
            }

            if (hasMaxPoint) {
                maxPoint = getter(max + 1);
            }
        } else {
            let outPoint, pointHasValue;
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