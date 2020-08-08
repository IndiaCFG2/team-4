import { Chart } from '../chart';
import { BAR, BULLET, PIE, COLUMN, VERTICAL_BULLET } from '../chart/constants';
import{ addClass, deepExtend, elementSize, getSpacing, inArray, isArray, isNumber, setDefaultOptions } from '../common';
import SharedTooltip from './shared-tooltip';

var DEAULT_BAR_WIDTH = 150;
var DEAULT_BULLET_WIDTH = 150;
var NO_CROSSHAIR = [ BAR, BULLET ];

function hide(children) {
    var state = [];
    for (var idx = 0; idx < children.length; idx++) {
        var child = children[idx];
        state[idx] = child.style.display;
        child.style.display = "none";
    }

    return state;
}

function show(children, state) {
    for (var idx = 0; idx < children.length; idx++) {
        children[idx].style.display = state[idx];
    }
}

function wrapNumber(value) {
    return isNumber(value) ? [ value ] : value;
}

var Sparkline = (function (Chart) {
    function Sparkline () {
        Chart.apply(this, arguments);
    }

    if ( Chart ) Sparkline.__proto__ = Chart;
    Sparkline.prototype = Object.create( Chart && Chart.prototype );
    Sparkline.prototype.constructor = Sparkline;

    Sparkline.prototype._setElementClass = function _setElementClass (element) {
        addClass(element, 'k-sparkline');
    };

    Sparkline.prototype._initElement = function _initElement (element) {
        Chart.prototype._initElement.call(this, element);

        this._initialWidth = Math.floor(elementSize(element).width);
    };

    Sparkline.prototype._resize = function _resize () {
        var element = this.element;
        var state = hide(element.childNodes);

        this._initialWidth = Math.floor(elementSize(element).width);

        show(element.childNodes, state);

        Chart.prototype._resize.call(this);
    };

    Sparkline.prototype._modelOptions = function _modelOptions () {
        var chartOptions = this.options;
        var stage = this._surfaceWrap();
        var displayState = hide(stage.childNodes);

        var space = document.createElement('span');
        space.innerHTML = '&nbsp;';

        stage.appendChild(space);

        var options = deepExtend({
            width: this._autoWidth,
            height: elementSize(stage).height,
            transitions: chartOptions.transitions
        }, chartOptions.chartArea, {
            inline: true,
            align: false
        });

        elementSize(stage, {
            width: options.width,
            height: options.height
        });

        stage.removeChild(space);

        show(stage.childNodes, displayState);

        if (this.surface) {
            this.surface.resize();
        }

        return options;
    };

    Sparkline.prototype._surfaceWrap = function _surfaceWrap () {
        if (!this.stage) {
            var stage = this.stage = document.createElement('span');
            this.element.appendChild(stage);
        }
        return this.stage;
    };

    Sparkline.prototype._createPlotArea = function _createPlotArea (skipSeries) {
        var plotArea = Chart.prototype._createPlotArea.call(this, skipSeries);
        this._autoWidth = this._initialWidth || this._calculateWidth(plotArea);

        return plotArea;
    };

    Sparkline.prototype._calculateWidth = function _calculateWidth (plotArea) {
        var options = this.options;
        var margin = getSpacing(options.chartArea.margin);
        var charts = plotArea.charts;
        var stage = this._surfaceWrap();
        var total = 0;


        for (var i = 0; i < charts.length; i++) {
            var currentChart = charts[i];
            var firstSeries = (currentChart.options.series || [])[0];
            if (!firstSeries) {
                continue;
            }

            if (firstSeries.type === BAR) {
                return DEAULT_BAR_WIDTH;
            }

            if (firstSeries.type === BULLET) {
                return DEAULT_BULLET_WIDTH;
            }

            if (firstSeries.type === PIE) {
                return elementSize(stage).height;
            }

            var categoryAxis = currentChart.categoryAxis;
            if (categoryAxis) {
                var pointsCount = categoryAxis.categoriesCount() *
                    (!currentChart.options.isStacked && inArray(firstSeries.type, [ COLUMN, VERTICAL_BULLET ]) ? currentChart.seriesOptions.length : 1);

                total = Math.max(total, pointsCount);
            }
        }

        var size = total * options.pointWidth;
        if (size > 0) {
            size += margin.left + margin.right;
        }

        return size;
    };

    Sparkline.prototype._createSharedTooltip = function _createSharedTooltip (options) {
        return new SharedTooltip(this._plotArea, options);
    };

    Sparkline.normalizeOptions = function normalizeOptions (userOptions) {
        var options = wrapNumber(userOptions);

        if (isArray(options)) {
            options = { seriesDefaults: { data: options } };
        } else {
            options = deepExtend({}, options);
        }

        if (!options.series) {
            options.series = [ { data: wrapNumber(options.data) } ];
        }

        deepExtend(options, {
            seriesDefaults: {
                type: options.type
            }
        });

        if (inArray(options.series[0].type, NO_CROSSHAIR) ||
            inArray(options.seriesDefaults.type, NO_CROSSHAIR)) {
            options = deepExtend({}, {
                categoryAxis: {
                    crosshair: {
                        visible: false
                    }
                }
            }, options);
        }

        return options;
    };

    return Sparkline;
}(Chart));

setDefaultOptions(Sparkline, {
    chartArea: {
        margin: 2
    },
    axisDefaults: {
        visible: false,
        majorGridLines: {
            visible: false
        },
        valueAxis: {
            narrowRange: true
        }
    },
    seriesDefaults: {
        type: "line",
        area: {
            line: {
                width: 0.5
            }
        },
        bar: {
            stack: true
        },
        padding: 2,
        width: 0.5,
        overlay: {
            gradient: null
        },
        highlight: {
            visible: false
        },
        border: {
            width: 0
        },
        markers: {
            size: 2,
            visible: false
        }
    },
    tooltip: {
        visible: true,
        shared: true
    },
    categoryAxis: {
        crosshair: {
            visible: true,
            tooltip: {
                visible: false
            }
        }
    },
    legend: {
        visible: false
    },
    transitions: false,

    pointWidth: 5,

    panes: [ { clip: false } ]
});

export default Sparkline;