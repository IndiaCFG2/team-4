import PolarPlotAreaBase from './polar-plotarea-base';
import PlotAreaBase from './plotarea-base';
import PolarLineChart from '../polar-line-chart/polar-line-chart';
import PolarScatterChart from '../polar-scatter-chart/polar-scatter-chart';
import PolarAreaChart from '../polar-area-chart/polar-area-chart';
import PlotAreaEventsMixin from '../mixins/plotarea-events-mixin';

import { PolarAxis, Point } from '../../core';

import { POLAR_AREA, POLAR_LINE, POLAR_SCATTER } from '../constants';

import filterSeriesByType from '../utils/filter-series-by-type';

import { ARC } from '../../common/constants';
import { deepExtend, eventElement, setDefaultOptions } from '../../common';

class PolarPlotArea extends PolarPlotAreaBase {
    createPolarAxis() {
        const polarAxis = new PolarAxis(this.options.xAxis, this.chartService);

        this.polarAxis = polarAxis;
        this.axisX = polarAxis;
        this.appendAxis(polarAxis);
    }

    valueAxisOptions(defaults) {
        return deepExtend(defaults, {
            majorGridLines: { type: ARC },
            minorGridLines: { type: ARC }
        }, this.options.yAxis);
    }

    createValueAxis() {
        super.createValueAxis();
        this.axisY = this.valueAxis;
    }

    appendChart(chart, pane) {
        this.valueAxisRangeTracker.update(chart.yAxisRanges);

        PlotAreaBase.prototype.appendChart.call(this, chart, pane);
    }

    createCharts() {
        const series = this.filterVisibleSeries(this.series);
        const pane = this.panes[0];

        this.createLineChart(
            filterSeriesByType(series, [ POLAR_LINE ]),
            pane
        );

        this.createScatterChart(
            filterSeriesByType(series, [ POLAR_SCATTER ]),
            pane
        );

        this.createAreaChart(
            filterSeriesByType(series, [ POLAR_AREA ]),
            pane
        );
    }

    createLineChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const lineChart = new PolarLineChart(this, { series: series });

        this.appendChart(lineChart, pane);
    }

    createScatterChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const scatterChart = new PolarScatterChart(this, { series: series });

        this.appendChart(scatterChart, pane);
    }

    createAreaChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const areaChart = new PolarAreaChart(this, { series: series });

        this.appendChart(areaChart, pane);
    }

    _dispatchEvent(chart, e, eventType) {
        const coords = chart._eventCoordinates(e);
        const point = new Point(coords.x, coords.y);
        const xValue = this.axisX.getValue(point);
        const yValue = this.axisY.getValue(point);

        if (xValue !== null && yValue !== null) {
            chart.trigger(eventType, {
                element: eventElement(e),
                x: xValue,
                y: yValue
            });
        }
    }

    createCrosshairs() {}
}

setDefaultOptions(PolarPlotArea, {
    xAxis: {},
    yAxis: {}
});

deepExtend(PolarPlotArea.prototype, PlotAreaEventsMixin);

export default PolarPlotArea;