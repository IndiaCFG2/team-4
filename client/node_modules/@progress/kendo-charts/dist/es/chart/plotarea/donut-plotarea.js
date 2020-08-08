import PiePlotArea from './pie-plotarea';
import DonutChart from '../donut-chart/donut-chart';

var DonutPlotArea = (function (PiePlotArea) {
    function DonutPlotArea () {
        PiePlotArea.apply(this, arguments);
    }

    if ( PiePlotArea ) DonutPlotArea.__proto__ = PiePlotArea;
    DonutPlotArea.prototype = Object.create( PiePlotArea && PiePlotArea.prototype );
    DonutPlotArea.prototype.constructor = DonutPlotArea;

    DonutPlotArea.prototype.render = function render () {
        this.createDonutChart(this.series);
    };

    DonutPlotArea.prototype.createDonutChart = function createDonutChart (series) {
        var firstSeries = series[0];
        var donutChart = new DonutChart(this, {
            series: series,
            padding: firstSeries.padding,
            connectors: firstSeries.connectors,
            legend: this.options.legend
        });

        this.appendChart(donutChart);
    };

    return DonutPlotArea;
}(PiePlotArea));

export default DonutPlotArea;