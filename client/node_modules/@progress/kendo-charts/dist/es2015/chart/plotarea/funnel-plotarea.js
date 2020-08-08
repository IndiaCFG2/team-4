import PlotAreaBase from './plotarea-base';
import FunnelChart from '../funnel-chart/funnel-chart';

import { append } from '../../common';

class FunnelPlotArea extends PlotAreaBase {
    render() {
        this.createFunnelChart(this.series);
    }

    createFunnelChart(series) {
        const firstSeries = series[0];
        const funnelChart = new FunnelChart(this, {
            series: series,
            legend: this.options.legend,
            neckRatio: firstSeries.neckRatio,
            dynamicHeight: firstSeries.dynamicHeight,
            dynamicSlope: firstSeries.dynamicSlope,
            segmentSpacing: firstSeries.segmentSpacing,
            highlight: firstSeries.highlight
        });

        this.appendChart(funnelChart);
    }

    appendChart(chart, pane) {
        super.appendChart(chart, pane);
        append(this.options.legend.items, chart.legendItems);
    }
}

export default FunnelPlotArea;