import { Class } from '../../common';

class DefaultAggregates extends Class {
    constructor() {
        super();

        this._defaults = {};
    }

    register(seriesTypes, aggregates) {
        for (let i = 0; i < seriesTypes.length; i++) {
            this._defaults[seriesTypes[i]] = aggregates;
        }
    }

    query(seriesType) {
        return this._defaults[seriesType];
    }
}

DefaultAggregates.current = new DefaultAggregates();

export default DefaultAggregates;