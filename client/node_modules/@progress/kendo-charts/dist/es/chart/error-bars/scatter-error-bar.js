import ErrorBarBase from './error-bar-base';

var ScatterErrorBar = (function (ErrorBarBase) {
    function ScatterErrorBar () {
        ErrorBarBase.apply(this, arguments);
    }

    if ( ErrorBarBase ) ScatterErrorBar.__proto__ = ErrorBarBase;
    ScatterErrorBar.prototype = Object.create( ErrorBarBase && ErrorBarBase.prototype );
    ScatterErrorBar.prototype.constructor = ScatterErrorBar;

    ScatterErrorBar.prototype.getAxis = function getAxis () {
        var axes = this.chart.seriesAxes(this.series);
        var axis = this.isVertical ? axes.y : axes.x;

        return axis;
    };

    return ScatterErrorBar;
}(ErrorBarBase));

export default ScatterErrorBar;