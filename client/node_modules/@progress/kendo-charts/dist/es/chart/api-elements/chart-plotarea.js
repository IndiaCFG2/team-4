import { Class } from '../../common';

var ChartPlotArea = (function (Class) {
    function ChartPlotArea(plotArea) {
        Class.call(this);

        this._plotArea = plotArea;
        this.visual = plotArea.visual;
        this.backgroundVisual = plotArea._bgVisual;
    }

    if ( Class ) ChartPlotArea.__proto__ = Class;
    ChartPlotArea.prototype = Object.create( Class && Class.prototype );
    ChartPlotArea.prototype.constructor = ChartPlotArea;

    return ChartPlotArea;
}(Class));

export default ChartPlotArea;