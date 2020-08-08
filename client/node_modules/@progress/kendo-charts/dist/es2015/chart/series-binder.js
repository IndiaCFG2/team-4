import getField from './utils/get-field';
import { VALUE } from '../common/constants';
import { Class, defined } from '../common';

class SeriesBinder extends Class {

    constructor() {
        super();

        this._valueFields = {};
        this._otherFields = {};
        this._nullValue = {};
        this._undefinedValue = {};
    }

    register(seriesTypes, valueFields = [ VALUE ], otherFields = {}) {

        for (let i = 0; i < seriesTypes.length; i++) {
            const type = seriesTypes[i];

            this._valueFields[type] = valueFields;
            this._otherFields[type] = otherFields;
            this._nullValue[type] = this._makeValue(valueFields, null);
            this._undefinedValue[type] = this._makeValue(valueFields, undefined);
        }
    }

    canonicalFields(series) {
        return this.valueFields(series).concat(this.otherFields(series));
    }

    valueFields(series) {
        return this._valueFields[series.type] || [ VALUE ];
    }

    otherFields(series) {
        return this._otherFields[series.type] || [ VALUE ];
    }

    bindPoint(series, pointIx, item) {
        const data = series.data;
        const pointData = defined(item) ? item : data[pointIx];
        const result = { valueFields: { value: pointData } };
        const valueFields = this.valueFields(series);
        const otherFields = this._otherFields[series.type];
        let fields, value;

        if (pointData === null) {
            value = this._nullValue[series.type];
        } else if (!defined(pointData)) {
            value = this._undefinedValue[series.type];
        } else if (Array.isArray(pointData)) {
            const fieldData = pointData.slice(valueFields.length);
            value = this._bindFromArray(pointData, valueFields);
            fields = this._bindFromArray(fieldData, otherFields);
        } else if (typeof pointData === "object") {
            const srcValueFields = this.sourceFields(series, valueFields);
            const srcPointFields = this.sourceFields(series, otherFields);

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
    }

    _makeValue(fields, initialValue) {
        const value = {};
        const length = fields.length;

        for (let i = 0; i < length; i++) {
            const fieldName = fields[i];
            value[fieldName] = initialValue;
        }

        return value;
    }

    _bindFromArray(array, fields) {
        const value = {};

        if (fields) {
            const length = Math.min(fields.length, array.length);

            for (let i = 0; i < length; i++) {
                value[fields[i]] = array[i];
            }
        }

        return value;
    }

    _bindFromObject(object, fields, srcFields = fields) {
        const value = {};

        if (fields) {
            const length = fields.length;

            for (let i = 0; i < length; i++) {
                const fieldName = fields[i];
                const srcFieldName = srcFields[i];
                if (srcFieldName !== null) {
                    value[fieldName] = getField(srcFieldName, object);
                }
            }
        }

        return value;
    }

    sourceFields(series, canonicalFields) {
        const sourceFields = [];

        if (canonicalFields) {
            const length = canonicalFields.length;

            for (let i = 0; i < length; i++) {
                const fieldName = canonicalFields[i];
                const sourceFieldName = fieldName === VALUE ? "field" : fieldName + "Field";

                sourceFields.push(series[sourceFieldName] !== null ? (series[sourceFieldName] || fieldName) : null);
            }
        }

        return sourceFields;
    }
}

SeriesBinder.current = new SeriesBinder();

export default SeriesBinder;