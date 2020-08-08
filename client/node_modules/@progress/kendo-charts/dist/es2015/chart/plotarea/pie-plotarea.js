import PlotAreaBase from './plotarea-base';
import PieChart from '../pie-chart/pie-chart';

import { append } from '../../common';

class PiePlotArea extends PlotAreaBase {
    render() {
        this.createPieChart(this.series);
    }

    createPieChart(series) {
        const firstSeries = series[0];
        const pieChart = new PieChart(this, {
            series: series,
            padding: firstSeries.padding,
            startAngle: firstSeries.startAngle,
            connectors: firstSeries.connectors,
            legend: this.options.legend
        });

        this.appendChart(pieChart);
    }

    appendChart(chart, pane) {
        super.appendChart(chart, pane);
        append(this.options.legend.items, chart.legendItems);
    }
}

export default PiePlotArea;