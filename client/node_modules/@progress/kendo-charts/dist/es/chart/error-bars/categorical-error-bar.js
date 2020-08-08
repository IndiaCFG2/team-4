import ErrorBarBase from './error-bar-base';

var CategoricalErrorBar = (function (ErrorBarBase) {
    function CategoricalErrorBar () {
        ErrorBarBase.apply(this, arguments);
    }

    if ( ErrorBarBase ) CategoricalErrorBar.__proto__ = ErrorBarBase;
    CategoricalErrorBar.prototype = Object.create( ErrorBarBase && ErrorBarBase.prototype );
    CategoricalErrorBar.prototype.constructor = CategoricalErrorBar;

    CategoricalErrorBar.prototype.getAxis = function getAxis () {
        var axis = this.chart.seriesValueAxis(this.series);

        return axis;
    };

    return CategoricalErrorBar;
}(ErrorBarBase));

export default CategoricalErrorBar;