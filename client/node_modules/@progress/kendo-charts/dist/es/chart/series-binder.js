import getField from './utils/get-field';
import { VALUE } from '../common/constants';
import { Class, defined } from '../common';

var SeriesBinder = (function (Class) {
    function SeriesBinder() {
        Class.call(this);

        this._valueFields = {};
        this._otherFields = {};
        this._nullValue = {};
        this._undefinedValue = {};
    }

    if ( Class ) SeriesBinder.__proto__ = Class;
    SeriesBinder.prototype = Object.create( Class && Class.prototype );
    SeriesBinder.prototype.constructor = SeriesBinder;

    SeriesBinder.prototype.register = function register (seriesTypes, valueFields, otherFields) {
        var this$1 = this;
        if ( valueFields === void 0 ) valueFields = [ VALUE ];
        if ( otherFields === void 0 ) otherFields = {};


        for (var i = 0; i < seriesTypes.length; i++) {
            var type = seriesTypes[i];

            this$1._valueFields[type] = valueFields;
            this$1._otherFields[type] = otherFields;
            this$1._nullValue[type] = this$1._makeValue(valueFields, null);
            this$1._undefinedValue[type] = this$1._makeValue(valueFields, undefined);
        }
    };

    SeriesBinder.prototype.canonicalFields = function canonicalFields (series) {
        return this.valueFields(series).concat(this.otherFields(series));
    };

    SeriesBinder.prototype.valueFields = function valueFields (series) {
        return this._valueFields[series.type] || [ VALUE ];
    };

    SeriesBinder.prototype.otherFields = function otherFields (series) {
        return this._otherFields[series.type] || [ VALUE ];
    };

    SeriesBinder.prototype.bindPoint = function bindPoint (series, pointIx, item) {
        var data = series.data;
        var pointData = defined(item) ? item : data[pointIx];
        var result = { valueFields: { value: pointData } };
        var valueFields = this.valueFields(series);
        var otherFields = this._otherFields[series.type];
        var fields, value;

        if (pointData === null) {
            value = this._nullValue[series.type];
        } else if (!defined(pointData)) {
            value = this._undefinedValue[series.type];
        } else if (Array.isArray(pointData)) {
            var fieldData = pointData.slice(valueFields.length);
            value = this._bindFromArray(pointData, valueFields);
            fields = this._bindFromArray(fieldData, otherFields);
        } else if (typeof pointData === "object") {
            var srcValueFields = this.sourceFields(series, valueFields);
            var srcPointFields = this.sourceFields(series, otherFields);

            value = this._bindFromObject(pointData, valueFields, srcValueFields);
            fields = this._bindFromObject(pointData, otherFields, srcPointFields);
        }

        if (defined(value)) {
            if (valueFields.length === 1) {
                result.valueFields.value = value[valueFields[0]];
            } else {
                result.valueFields = value;
            }
        }

        result.fields = fields || {};

        return result;
    };

    SeriesBinder.prototype._makeValue = function _makeValue (fields, initialValue) {
        var value = {};
        var length = fields.length;

        for (var i = 0; i < length; i++) {
            var fieldName = fields[i];
            value[fieldName] = initialValue;
        }

        return value;
    };

    SeriesBinder.prototype._bindFromArray = function _bindFromArray (array, fields) {
        var value = {};

        if (fields) {
            var length = Math.min(fields.length, array.length);

            for (var i = 0; i < length; i++) {
                value[fields[i]] = array[i];
            }
        }

        return value;
    };

    SeriesBinder.prototype._bindFromObject = function _bindFromObject (object, fields, srcFields) {
        if ( srcFields === void 0 ) srcFields = fields;

        var value = {};

        if (fields) {
            var length = fields.length;

            for (var i = 0; i < length; i++) {
                var fieldName = fields[i];
                var srcFieldName = srcFields[i];
                if (srcFieldName !== null) {
                    value[fieldName] = getField(srcFieldName, object);
                }
            }
        }

        return value;
    };

    SeriesBinder.prototype.sourceFields = function sourceFields (series, canonicalFields) {
        var sourceFields = [];

        if (canonicalFields) {
            var length = canonicalFields.length;

            for (var i = 0; i < length; i++) {
                var fieldName = canonicalFields[i];
                var sourceFieldName = fieldName === VALUE ? "field" : fieldName + "Field";

                sourceFields.push(series[sourceFieldName] !== null ? (series[sourceFieldName] || fieldName) : null);
            }
        }

        return sourceFields;
    };

    return SeriesBinder;
}(Class));

SeriesBinder.current = new SeriesBinder();

export default SeriesBinder;