import PlotAreaBase from './plotarea-base';
import PieChart from '../pie-chart/pie-chart';

import { append } from '../../common';

var PiePlotArea = (function (PlotAreaBase) {
    function PiePlotArea () {
        PlotAreaBase.apply(this, arguments);
    }

    if ( PlotAreaBase ) PiePlotArea.__proto__ = PlotAreaBase;
    PiePlotArea.prototype = Object.create( PlotAreaBase && PlotAreaBase.prototype );
    PiePlotArea.prototype.constructor = PiePlotArea;

    PiePlotArea.prototype.render = function render () {
        this.createPieChart(this.series);
    };

    PiePlotArea.prototype.createPieChart = function createPieChart (series) {
        var firstSeries = series[0];
        var pieChart = new PieChart(this, {
            series: series,
            padding: firstSeries.padding,
            startAngle: firstSeries.startAngle,
            connectors: firstSeries.connectors,
            legend: this.options.legend
        });

        this.appendChart(pieChart);
    };

    PiePlotArea.prototype.appendChart = function appendChart (chart, pane) {
        PlotAreaBase.prototype.appendChart.call(this, chart, pane);
        append(this.options.legend.items, chart.legendItems);
    };

    return PiePlotArea;
}(PlotAreaBase));

export default PiePlotArea;