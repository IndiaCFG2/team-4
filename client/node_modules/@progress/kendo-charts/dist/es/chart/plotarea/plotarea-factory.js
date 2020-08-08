import filterSeriesByType from '../utils/filter-series-by-type';
import { Class } from '../../common';

var PlotAreaFactory = (function (Class) {
    function PlotAreaFactory() {
        Class.call(this);

        this._registry = [];
    }

    if ( Class ) PlotAreaFactory.__proto__ = Class;
    PlotAreaFactory.prototype = Object.create( Class && Class.prototype );
    PlotAreaFactory.prototype.constructor = PlotAreaFactory;

    PlotAreaFactory.prototype.register = function register (type, seriesTypes) {
        this._registry.push({
            type: type,
            seriesTypes: seriesTypes
        });
    };

    PlotAreaFactory.prototype.create = function create (srcSeries, options, chartService) {
        var registry = this._registry;
        var match = registry[0];
        var series;

        for (var idx = 0; idx < registry.length; idx++) {
            var entry = registry[idx];
            series = filterSeriesByType(srcSeries, entry.seriesTypes);

            if (series.length > 0) {
                match = entry;
                break;
            }
        }

        return new match.type(series, options, chartService);
    };

    return PlotAreaFactory;
}(Class));

PlotAreaFactory.current = new PlotAreaFactory();

export default PlotAreaFactory;