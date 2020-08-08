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

var PolarPlotArea = (function (PolarPlotAreaBase) {
    function PolarPlotArea () {
        PolarPlotAreaBase.apply(this, arguments);
    }

    if ( PolarPlotAreaBase ) PolarPlotArea.__proto__ = PolarPlotAreaBase;
    PolarPlotArea.prototype = Object.create( PolarPlotAreaBase && PolarPlotAreaBase.prototype );
    PolarPlotArea.prototype.constructor = PolarPlotArea;

    PolarPlotArea.prototype.createPolarAxis = function createPolarAxis () {
        var polarAxis = new PolarAxis(this.options.xAxis, this.chartService);

        this.polarAxis = polarAxis;
        this.axisX = polarAxis;
        this.appendAxis(polarAxis);
    };

    PolarPlotArea.prototype.valueAxisOptions = function valueAxisOptions (defaults) {
        return deepExtend(defaults, {
            majorGridLines: { type: ARC },
            minorGridLines: { type: ARC }
        }, this.options.yAxis);
    };

    PolarPlotArea.prototype.createValueAxis = function createValueAxis () {
        PolarPlotAreaBase.prototype.createValueAxis.call(this);
        this.axisY = this.valueAxis;
    };

    PolarPlotArea.prototype.appendChart = function appendChart (chart, pane) {
        this.valueAxisRangeTracker.update(chart.yAxisRanges);

        PlotAreaBase.prototype.appendChart.call(this, chart, pane);
    };

    PolarPlotArea.prototype.createCharts = function createCharts () {
        var series = this.filterVisibleSeries(this.series);
        var pane = this.panes[0];

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
    };

    PolarPlotArea.prototype.createLineChart = function createLineChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var lineChart = new PolarLineChart(this, { series: series });

        this.appendChart(lineChart, pane);
    };

    PolarPlotArea.prototype.createScatterChart = function createScatterChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var scatterChart = new PolarScatterChart(this, { series: series });

        this.appendChart(scatterChart, pane);
    };

    PolarPlotArea.prototype.createAreaChart = function createAreaChart (series, pane) {
        if (series.length === 0) {
            return;
        }

        var areaChart = new PolarAreaChart(this, { series: series });

        this.appendChart(areaChart, pane);
    };

    PolarPlotArea.prototype._dispatchEvent = function _dispatchEvent (chart, e, eventType) {
        var coords = chart._eventCoordinates(e);
        var point = new Point(coords.x, coords.y);
        var xValue = this.axisX.getValue(point);
        var yValue = this.axisY.getValue(point);

        if (xValue !== null && yValue !== null) {
            chart.trigger(eventType, {
                element: eventElement(e),
                x: xValue,
                y: yValue
            });
        }
    };

    PolarPlotArea.prototype.createCrosshairs = function createCrosshairs () {};

    return PolarPlotArea;
}(PolarPlotAreaBase));

setDefaultOptions(PolarPlotArea, {
    xAxis: {},
    yAxis: {}
});

deepExtend(PolarPlotArea.prototype, PlotAreaEventsMixin);

export default PolarPlotArea;