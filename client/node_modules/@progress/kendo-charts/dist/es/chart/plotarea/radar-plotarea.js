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

var RadarPlotArea = (function (PolarPlotAreaBase) {
    function RadarPlotArea () {
        PolarPlotAreaBase.apply(this, arguments);
    }

    if ( PolarPlotAreaBase ) RadarPlotArea.__proto__ = PolarPlotAreaBase;
    RadarPlotArea.prototype = Object.create( PolarPlotAreaBase && PolarPlotAreaBase.prototype );
    RadarPlotArea.prototype.constructor = RadarPlotArea;

    RadarPlotArea.prototype.createPolarAxis = function createPolarAxis () {
        var categoryAxis = new RadarCategoryAxis(this.options.categoryAxis, this.chartService);

        this.polarAxis = categoryAxis;
        this.categoryAxis = categoryAxis;
        this.appendAxis(categoryAxis);
        this.aggregateCategories();
        this.createCategoryAxesLabels();
    };

    RadarPlotArea.prototype.valueAxisOptions = function valueAxisOptions (defaults) {
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
    };

    RadarPlotArea.prototype.aggregateCategories = function aggregateCategories () {
        // No separate panes in radar charts
        CategoricalPlotArea.prototype.aggregateCategories.call(this, this.panes);
    };

    RadarPlotArea.prototype.createCategoryAxesLabels = function createCategoryAxesLabels () {
        CategoricalPlotArea.prototype.createCategoryAxesLabels.call(this, this.panes);
    };

    RadarPlotArea.prototype.filterSeries = function filterSeries (currentSeries) {
        // Not supported for radar charts
        return currentSeries;
    };

    RadarPlotArea.prototype.createCharts = function createCharts () {
        var series = this.filterVisibleSeries(this.series);
        var pane = this.panes[0];

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
    };

    RadarPlotArea.prototype.chartOptions = function chartOptions (series) {
        var options = { series: series };
        var firstSeries = series[0];
        if (firstSeries) {
            var filteredSeries = this.filterVisibleSeries(series);
            var stack = firstSeries.stack;
            options.isStacked = stack && filteredSeries.length > 1;
            options.isStacked100 = stack && stack.type === "100%" && filteredSeries.length > 1;

            if (options.isStacked100) {
                this._isStacked100 = true;
            }
        }

        return options;
    };

    RadarPlotArea.prototype.createAreaChart = function createAreaChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var areaChart = new RadarAreaChart(this, this.chartOptions(series));
        this.appendChart(areaChart, pane);
    };

    RadarPlotArea.prototype.createLineChart = function createLineChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var lineChart = new RadarLineChart(this, this.chartOptions(series));
        this.appendChart(lineChart, pane);
    };

    RadarPlotArea.prototype.createBarChart = function createBarChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var firstSeries = series[0];
        var options = this.chartOptions(series);
        options.gap = firstSeries.gap;
        options.spacing = firstSeries.spacing;

        var barChart = new RadarBarChart(this, options);
        this.appendChart(barChart, pane);

        this._hasBarCharts = true;
    };

    RadarPlotArea.prototype.seriesCategoryAxis = function seriesCategoryAxis () {
        return this.categoryAxis;
    };

    RadarPlotArea.prototype._dispatchEvent = function _dispatchEvent (chart, e, eventType) {
        var coords = chart._eventCoordinates(e);
        var point = new Point(coords.x, coords.y);
        var category = this.categoryAxis.getCategory(point);
        var value = this.valueAxis.getValue(point);

        if (category !== null && value !== null) {
            chart.trigger(eventType, {
                element: eventElement(e),
                category: category,
                value: value
            });
        }
    };

    RadarPlotArea.prototype.createCrosshairs = function createCrosshairs () {};

    return RadarPlotArea;
}(PolarPlotAreaBase));

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