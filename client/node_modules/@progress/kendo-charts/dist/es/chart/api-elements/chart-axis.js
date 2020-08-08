import { Class } from '../../common';

var ChartAxis = (function (Class) {
    function ChartAxis(axis) {
        Class.call(this);

        this._axis = axis;
        this.options = axis.options;
    }

    if ( Class ) ChartAxis.__proto__ = Class;
    ChartAxis.prototype = Object.create( Class && Class.prototype );
    ChartAxis.prototype.constructor = ChartAxis;

    ChartAxis.prototype.value = function value (point) {
        var axis = this._axis;
        var value = axis.getCategory ? axis.getCategory(point) : axis.getValue(point);

        return value;
    };

    ChartAxis.prototype.slot = function slot (from, to, limit) {
        if ( limit === void 0 ) limit = true;

        return this._axis.slot(from, to, limit);
    };

    ChartAxis.prototype.range = function range () {
        return this._axis.range();
    };

    ChartAxis.prototype.valueRange = function valueRange () {
        return this._axis.valueRange();
    };

    return ChartAxis;
}(Class));

export default ChartAxis;