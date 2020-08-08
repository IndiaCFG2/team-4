import PlotAreaBase from './plotarea-base';
import FunnelChart from '../funnel-chart/funnel-chart';

import { append } from '../../common';

var FunnelPlotArea = (function (PlotAreaBase) {
    function FunnelPlotArea () {
        PlotAreaBase.apply(this, arguments);
    }

    if ( PlotAreaBase ) FunnelPlotArea.__proto__ = PlotAreaBase;
    FunnelPlotArea.prototype = Object.create( PlotAreaBase && PlotAreaBase.prototype );
    FunnelPlotArea.prototype.constructor = FunnelPlotArea;

    FunnelPlotArea.prototype.render = function render () {
        this.createFunnelChart(this.series);
    };

    FunnelPlotArea.prototype.createFunnelChart = function createFunnelChart (series) {
        var firstSeries = series[0];
        var funnelChart = new FunnelChart(this, {
            series: series,
            legend: this.options.legend,
            neckRatio: firstSeries.neckRatio,
            dynamicHeight: firstSeries.dynamicHeight,
            dynamicSlope: firstSeries.dynamicSlope,
            segmentSpacing: firstSeries.segmentSpacing,
            highlight: firstSeries.highlight
        });

        this.appendChart(funnelChart);
    };

    FunnelPlotArea.prototype.appendChart = function appendChart (chart, pane) {
        PlotAreaBase.prototype.appendChart.call(this, chart, pane);
        append(this.options.legend.items, chart.legendItems);
    };

    return FunnelPlotArea;
}(PlotAreaBase));

export default FunnelPlotArea;