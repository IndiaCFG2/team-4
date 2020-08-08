import Aggregates from './aggregates';

import { Class, defined, inArray, isArray, isFunction, isNumber, isObject } from '../../common';

var SeriesAggregator = (function (Class) {
    function SeriesAggregator(series, binder, defaultAggregates) {
        Class.call(this);

        var canonicalFields = binder.canonicalFields(series);
        var valueFields = binder.valueFields(series);
        var sourceFields = binder.sourceFields(series, canonicalFields);
        var seriesFields = this._seriesFields = [];
        var defaults = defaultAggregates.query(series.type);
        var rootAggregate = series.aggregate || defaults;

        this._series = series;
        this._binder = binder;

        for (var i = 0; i < canonicalFields.length; i++) {
            var field = canonicalFields[i];
            var fieldAggregate = (void 0);

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

    if ( Class ) SeriesAggregator.__proto__ = Class;
    SeriesAggregator.prototype = Object.create( Class && Class.prototype );
    SeriesAggregator.prototype.constructor = SeriesAggregator;

    SeriesAggregator.prototype.aggregatePoints = function aggregatePoints (srcPoints, group) {
        var this$1 = this;

        var ref = this;
        var series = ref._series;
        var seriesFields = ref._seriesFields;
        var data = this._bindPoints(srcPoints || []);
        var firstDataItem = data.dataItems[0];
        var result = {};

        if (firstDataItem && !isNumber(firstDataItem) && !isArray(firstDataItem)) {
            var fn = function() {};
            fn.prototype = firstDataItem;
            result = new fn();
        }

        for (var i = 0; i < seriesFields.length; i++) {
            var field = seriesFields[i];
            var srcValues = this$1._bindField(data.values, field.canonicalName);
            var value = field.transform(srcValues, series, data.dataItems, group);

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
    };

    SeriesAggregator.prototype._bindPoints = function _bindPoints (points) {
        var ref = this;
        var binder = ref._binder;
        var series = ref._series;
        var values = [];
        var dataItems = [];

        for (var i = 0; i < points.length; i++) {
            var pointIx = points[i];

            values.push(binder.bindPoint(series, pointIx));
            dataItems.push(series.data[pointIx]);
        }

        return {
            values: values,
            dataItems: dataItems
        };
    };

    SeriesAggregator.prototype._bindField = function _bindField (data, field) {
        var values = [];
        var count = data.length;

        for (var i = 0; i < count; i++) {
            var item = data[i];
            var valueFields = item.valueFields;
            var value = (void 0);

            if (defined(valueFields[field])) {
                value = valueFields[field];
            } else {
                value = item.fields[field];
            }

            values.push(value);
        }

        return values;
    };

    return SeriesAggregator;
}(Class));

function setValue(fieldName, target, value) {
    var parentObj = target;
    var field = fieldName;

    if (fieldName.indexOf(".") > -1) {
        var parts = fieldName.split(".");

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