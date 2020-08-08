import { Chart } from '../chart';

import Navigator from './navigator';
import { DEFAULT_WIDTH } from '../common/constants';
import { addClass, deepExtend, elementSize, grep, setDefaultOptions } from '../common';
import { NAVIGATOR_AXIS, NAVIGATOR_PANE } from './constants';

var AUTO_CATEGORY_WIDTH = 28;

var StockChart = (function (Chart) {
    function StockChart () {
        Chart.apply(this, arguments);
    }

    if ( Chart ) StockChart.__proto__ = Chart;
    StockChart.prototype = Object.create( Chart && Chart.prototype );
    StockChart.prototype.constructor = StockChart;

    StockChart.prototype.applyDefaults = function applyDefaults (options, themeOptions) {
        var width = elementSize(this.element).width || DEFAULT_WIDTH;
        var theme = themeOptions;

        var stockDefaults = {
            seriesDefaults: {
                categoryField: options.dateField
            },
            axisDefaults: {
                categoryAxis: {
                    name: "default",
                    majorGridLines: {
                        visible: false
                    },
                    labels: {
                        step: 2
                    },
                    majorTicks: {
                        visible: false
                    },
                    maxDateGroups: Math.floor(width / AUTO_CATEGORY_WIDTH)
                }
            }
        };

        if (theme) {
            theme = deepExtend({}, theme, stockDefaults);
        }

        Navigator.setup(options, theme);

        Chart.prototype.applyDefaults.call(this, options, theme);
    };

    StockChart.prototype._setElementClass = function _setElementClass (element) {
        addClass(element, 'k-chart k-stockchart');
    };

    StockChart.prototype.setOptions = function setOptions (options) {
        this.destroyNavigator();
        Chart.prototype.setOptions.call(this, options);
    };

    StockChart.prototype.noTransitionsRedraw = function noTransitionsRedraw () {
        var transitions = this.options.transitions;

        this.options.transitions = false;
        this._fullRedraw();
        this.options.transitions = transitions;
    };

    StockChart.prototype._resize = function _resize () {
        this.noTransitionsRedraw();
    };

    StockChart.prototype._redraw = function _redraw () {
        var navigator = this.navigator;

        if (!this._dirty() && navigator && navigator.options.partialRedraw) {
            navigator.redrawSlaves();
        } else {
            this._fullRedraw();
        }
    };

    StockChart.prototype._dirty = function _dirty () {
        var options = this.options;
        var series = [].concat(options.series, options.navigator.series);
        var seriesCount = grep(series, function(s) { return s && s.visible; }).length;
        var dirty = this._seriesCount !== seriesCount;
        this._seriesCount = seriesCount;

        return dirty;
    };

    StockChart.prototype._fullRedraw = function _fullRedraw () {
        var navigator = this.navigator;

        if (!navigator) {
            navigator = this.navigator = new Navigator(this);
            this.trigger("navigatorCreated", { navigator: navigator });
        }

        navigator.clean();
        navigator.setRange();

        Chart.prototype._redraw.call(this);

        navigator.initSelection();
    };

    StockChart.prototype._trackSharedTooltip = function _trackSharedTooltip (coords) {
        var plotArea = this._plotArea;
        var pane = plotArea.paneByPoint(coords);

        if (pane && pane.options.name === NAVIGATOR_PANE) {
            this._unsetActivePoint();
        } else {
            Chart.prototype._trackSharedTooltip.call(this, coords);
        }
    };

    StockChart.prototype.bindCategories = function bindCategories () {
        Chart.prototype.bindCategories.call(this);
        this.copyNavigatorCategories();
    };

    StockChart.prototype.copyNavigatorCategories = function copyNavigatorCategories () {
        var definitions = [].concat(this.options.categoryAxis);
        var categories;

        for (var axisIx = 0; axisIx < definitions.length; axisIx++) {
            var axis = definitions[axisIx];
            if (axis.name === NAVIGATOR_AXIS) {
                categories = axis.categories;
            } else if (categories && axis.pane === NAVIGATOR_PANE) {
                axis.categories = categories;
            }
        }
    };

    StockChart.prototype.destroyNavigator = function destroyNavigator () {
        if (this.navigator) {
            this.navigator.destroy();
            this.navigator = null;
        }
    };

    StockChart.prototype.destroy = function destroy () {
        this.destroyNavigator();
        Chart.prototype.destroy.call(this);
    };

    StockChart.prototype._stopChartHandlers = function _stopChartHandlers (e) {
        var coords = this._eventCoordinates(e);
        var pane = this._plotArea.paneByPoint(coords);

        return Chart.prototype._stopChartHandlers.call(this, e) || (pane && pane.options.name === NAVIGATOR_PANE);
    };

    StockChart.prototype._toggleDragZoomEvents = function _toggleDragZoomEvents () {
        if (!this._dragZoomEnabled) {
            this.element.style.touchAction = "none";

            this._dragZoomEnabled = true;
        }
    };

    return StockChart;
}(Chart));

setDefaultOptions(StockChart, {
    dateField: "date",
    axisDefaults: {
        categoryAxis: {
            type: "date",
            baseUnit: "fit",
            justified: true
        },
        valueAxis: {
            narrowRange: true,
            labels: {
                format: "C"
            }
        }
    },
    navigator: {
        select: {},
        seriesDefaults: {
            markers: {
                visible: false
            },
            tooltip: {
                visible: true
            },
            line: {
                width: 2
            }
        },
        hint: {},
        visible: true
    },
    tooltip: {
        visible: true
    },
    legend: {
        visible: false
    }
});

export default StockChart;