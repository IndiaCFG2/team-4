import PolarPlotAreaBase from './polar-plotarea-base';
import CategoricalPlotArea from './categorical-plotarea';
import RadarAreaChart from '../radar-area-chart/radar-area-chart';
import RadarLineChart from '../radar-line-chart/radar-line-chart';
import RadarBarChart from '../radar-bar-chart/radar-bar-chart';
import PlotAreaEventsMixin from '../mixins/plotarea-events-mixin';

import { RadarCategoryAxis, Point } from '../../core';

import { RADAR_AREA, RADAR_LINE, RADAR_COLUMN } from '../constants';

import filterSeriesByType from '../utils/filter-series-by-type';

import { ARC } from '../../common/constants';
import { eventElement, deepExtend, setDefaultOptions } from '../../common';

class RadarPlotArea extends PolarPlotAreaBase {
    createPolarAxis() {
        const categoryAxis = new RadarCategoryAxis(this.options.categoryAxis, this.chartService);

        this.polarAxis = categoryAxis;
        this.categoryAxis = categoryAxis;
        this.appendAxis(categoryAxis);
        this.aggregateCategories();
        this.createCategoryAxesLabels();
    }

    valueAxisOptions(defaults) {
        if (this._hasBarCharts) {
            deepExtend(defaults, {
                majorGridLines: { type: ARC },
                minorGridLines: { type: ARC }
            });
        }

        if (this._isStacked100) {
            deepExtend(defaults, {
                roundToMajorUnit: false,
                labels: { format: "P0" }
            });
        }

        return deepExtend(defaults, this.options.valueAxis);
    }

    aggregateCategories() {
        // No separate panes in radar charts
        CategoricalPlotArea.prototype.aggregateCategories.call(this, this.panes);
    }

    createCategoryAxesLabels() {
        CategoricalPlotArea.prototype.createCategoryAxesLabels.call(this, this.panes);
    }

    filterSeries(currentSeries) {
        // Not supported for radar charts
        return currentSeries;
    }

    createCharts() {
        const series = this.filterVisibleSeries(this.series);
        const pane = this.panes[0];

        this.createAreaChart(
            filterSeriesByType(series, [ RADAR_AREA ]),
            pane
        );

        this.createLineChart(
            filterSeriesByType(series, [ RADAR_LINE ]),
            pane
        );

        this.createBarChart(
            filterSeriesByType(series, [ RADAR_COLUMN ]),
            pane
        );
    }

    chartOptions(series) {
        const options = { series: series };
        const firstSeries = series[0];
        if (firstSeries) {
            const filteredSeries = this.filterVisibleSeries(series);
            const stack = firstSeries.stack;
            options.isStacked = stack && filteredSeries.length > 1;
            options.isStacked100 = stack && stack.type === "100%" && filteredSeries.length > 1;

            if (options.isStacked100) {
                this._isStacked100 = true;
            }
        }

        return options;
    }

    createAreaChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const areaChart = new RadarAreaChart(this, this.chartOptions(series));
        this.appendChart(areaChart, pane);
    }

    createLineChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const lineChart = new RadarLineChart(this, this.chartOptions(series));
        this.appendChart(lineChart, pane);
    }

    createBarChart(series, pane) {
        if (series.length === 0) {
            return;
        }

        const firstSeries = series[0];
        const options = this.chartOptions(series);
        options.gap = firstSeries.gap;
        options.spacing = firstSeries.spacing;

        const barChart = new RadarBarChart(this, options);
        this.appendChart(barChart, pane);

        this._hasBarCharts = true;
    }

    seriesCategoryAxis() {
        return this.categoryAxis;
    }

    _dispatchEvent(chart, e, eventType) {
        const coords = chart._eventCoordinates(e);
        const point = new Point(coords.x, coords.y);
        const category = this.categoryAxis.getCategory(point);
        const value = this.valueAxis.getValue(point);

        if (category !== null && value !== null) {
            chart.trigger(eventType, {
                element: eventElement(e),
                category: category,
                value: value
            });
        }
    }

    createCrosshairs() {}
}

deepExtend(RadarPlotArea.prototype, PlotAreaEventsMixin, {
    appendChart: CategoricalPlotArea.prototype.appendChart,
    aggregateSeries: CategoricalPlotArea.prototype.aggregateSeries,
    seriesSourcePoints: CategoricalPlotArea.prototype.seriesSourcePoints
});

setDefaultOptions(RadarPlotArea, {
    categoryAxis: {
        categories: []
    },
    valueAxis: {}
});

export default RadarPlotArea;