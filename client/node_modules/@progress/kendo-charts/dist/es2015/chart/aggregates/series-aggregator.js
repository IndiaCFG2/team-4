import Aggregates from './aggregates';

import { Class, defined, inArray, isArray, isFunction, isNumber, isObject } from '../../common';

class SeriesAggregator extends Class {
    constructor(series, binder, defaultAggregates) {
        super();

        const canonicalFields = binder.canonicalFields(series);
        const valueFields = binder.valueFields(series);
        const sourceFields = binder.sourceFields(series, canonicalFields);
        const seriesFields = this._seriesFields = [];
        const defaults = defaultAggregates.query(series.type);
        const rootAggregate = series.aggregate || defaults;

        this._series = series;
        this._binder = binder;

        for (let i = 0; i < canonicalFields.length; i++) {
            const field = canonicalFields[i];
            let fieldAggregate;

            if (isObject(rootAggregate)) {
                fieldAggregate = rootAggregate[field];
            } else if (i === 0 || inArray(field, valueFields)) {
                fieldAggregate = rootAggregate;
            } else {
                break;
            }

            if (fieldAggregate) {
                seriesFields.push({
                    canonicalName: field,
                    name: sourceFields[i],
                    transform: isFunction(fieldAggregate) ? fieldAggregate : Aggregates[fieldAggregate]
                });
            }
        }
    }

    aggregatePoints(srcPoints, group) {
        const { _series: series, _seriesFields: seriesFields } = this;
        const data = this._bindPoints(srcPoints || []);
        const firstDataItem = data.dataItems[0];
        let result = {};

        if (firstDataItem && !isNumber(firstDataItem) && !isArray(firstDataItem)) {
            const fn = function() {};
            fn.prototype = firstDataItem;
            result = new fn();
        }

        for (let i = 0; i < seriesFields.length; i++) {
            const field = seriesFields[i];
            const srcValues = this._bindField(data.values, field.canonicalName);
            const value = field.transform(srcValues, series, data.dataItems, group);

            if (value !== null && isObject(value) && !defined(value.length) && !(value instanceof Date)) {
                result = value;
                break;
            } else {
                if (defined(value)) {
                    setValue(field.name, result, value);
                }
            }
        }

        return result;
    }

    _bindPoints(points) {
        const { _binder: binder, _series: series } = this;
        const values = [];
        const dataItems = [];

        for (let i = 0; i < points.length; i++) {
            const pointIx = points[i];

            values.push(binder.bindPoint(series, pointIx));
            dataItems.push(series.data[pointIx]);
        }

        return {
            values: values,
            dataItems: dataItems
        };
    }

    _bindField(data, field) {
        const values = [];
        const count = data.length;

        for (let i = 0; i < count; i++) {
            const item = data[i];
            const valueFields = item.valueFields;
            let value;

            if (defined(valueFields[field])) {
                value = valueFields[field];
            } else {
                value = item.fields[field];
            }

            values.push(value);
        }

        return values;
    }
}

function setValue(fieldName, target, value) {
    let parentObj = target;
    let field = fieldName;

    if (fieldName.indexOf(".") > -1) {
        const parts = fieldName.split(".");

        while (parts.length > 1) {
            field = parts.shift();
            if (!defined(parentObj[field])) {
                parentObj[field] = {};
            }
            parentObj = parentObj[field];
        }
        field = parts.shift();
    }

    parentObj[field] = value;
}

export default SeriesAggregator;