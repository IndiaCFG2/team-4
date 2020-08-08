import { Class } from '../../common';

var DefaultAggregates = (function (Class) {
    function DefaultAggregates() {
        Class.call(this);

        this._defaults = {};
    }

    if ( Class ) DefaultAggregates.__proto__ = Class;
    DefaultAggregates.prototype = Object.create( Class && Class.prototype );
    DefaultAggregates.prototype.constructor = DefaultAggregates;

    DefaultAggregates.prototype.register = function register (seriesTypes, aggregates) {
        var this$1 = this;

        for (var i = 0; i < seriesTypes.length; i++) {
            this$1._defaults[seriesTypes[i]] = aggregates;
        }
    };

    DefaultAggregates.prototype.query = function query (seriesType) {
        return this._defaults[seriesType];
    };

    return DefaultAggregates;
}(Class));

DefaultAggregates.current = new DefaultAggregates();

export default DefaultAggregates;