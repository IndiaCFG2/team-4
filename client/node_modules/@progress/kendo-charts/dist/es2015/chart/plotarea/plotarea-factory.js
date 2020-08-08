import filterSeriesByType from '../utils/filter-series-by-type';
import { Class } from '../../common';

class PlotAreaFactory extends Class {

    constructor() {
        super();

        this._registry = [];
    }

    register(type, seriesTypes) {
        this._registry.push({
            type: type,
            seriesTypes: seriesTypes
        });
    }

    create(srcSeries, options, chartService) {
        const registry = this._registry;
        let match = registry[0];
        let series;

        for (let idx = 0; idx < registry.length; idx++) {
            const entry = registry[idx];
            series = filterSeriesByType(srcSeries, entry.seriesTypes);

            if (series.length > 0) {
                match = entry;
                break;
            }
        }

        return new match.type(series, options, chartService);
    }
}

PlotAreaFactory.current = new PlotAreaFactory();

export default PlotAreaFactory;