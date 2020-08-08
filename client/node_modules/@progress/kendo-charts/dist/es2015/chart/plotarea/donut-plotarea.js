import PiePlotArea from './pie-plotarea';
import DonutChart from '../donut-chart/donut-chart';

class DonutPlotArea extends PiePlotArea {
    render() {
        this.createDonutChart(this.series);
    }

    createDonutChart(series) {
        const firstSeries = series[0];
        const donutChart = new DonutChart(this, {
            series: series,
            padding: firstSeries.padding,
            connectors: firstSeries.connectors,
            legend: this.options.legend
        });

        this.appendChart(donutChart);
    }
}

export default DonutPlotArea;