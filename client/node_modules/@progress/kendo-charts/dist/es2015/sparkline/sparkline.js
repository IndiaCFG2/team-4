import { Chart } from '../chart';
import { BAR, BULLET, PIE, COLUMN, VERTICAL_BULLET } from '../chart/constants';
import{ addClass, deepExtend, elementSize, getSpacing, inArray, isArray, isNumber, setDefaultOptions } from '../common';
import SharedTooltip from './shared-tooltip';

const DEAULT_BAR_WIDTH = 150;
const DEAULT_BULLET_WIDTH = 150;
const NO_CROSSHAIR = [ BAR, BULLET ];

function hide(children) {
    const state = [];
    for (let idx = 0; idx < children.length; idx++) {
        const child = children[idx];
        state[idx] = child.style.display;
        child.style.display = "none";
    }

    return state;
}

function show(children, state) {
    for (let idx = 0; idx < children.length; idx++) {
        children[idx].style.display = state[idx];
    }
}

function wrapNumber(value) {
    return isNumber(value) ? [ value ] : value;
}

class Sparkline extends Chart {
    _setElementClass(element) {
        addClass(element, 'k-sparkline');
    }

    _initElement(element) {
        super._initElement(element);

        this._initialWidth = Math.floor(elementSize(element).width);
    }

    _resize() {
        const element = this.element;
        const state = hide(element.childNodes);

        this._initialWidth = Math.floor(elementSize(element).width);

        show(element.childNodes, state);

        super._resize();
    }

    _modelOptions() {
        const chartOptions = this.options;
        const stage = this._surfaceWrap();
        const displayState = hide(stage.childNodes);

        const space = document.createElement('span');
        space.innerHTML = '&nbsp;';

        stage.appendChild(space);

        const options = deepExtend({
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
    }

    _surfaceWrap() {
        if (!this.stage) {
            const stage = this.stage = document.createElement('span');
            this.element.appendChild(stage);
        }
        return this.stage;
    }

    _createPlotArea(skipSeries) {
        const plotArea = super._createPlotArea(skipSeries);
        this._autoWidth = this._initialWidth || this._calculateWidth(plotArea);

        return plotArea;
    }

    _calculateWidth(plotArea) {
        const options = this.options;
        const margin = getSpacing(options.chartArea.margin);
        const charts = plotArea.charts;
        const stage = this._surfaceWrap();
        let total = 0;


        for (let i = 0; i < charts.length; i++) {
            const currentChart = charts[i];
            const firstSeries = (currentChart.options.series || [])[0];
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

            const categoryAxis = currentChart.categoryAxis;
            if (categoryAxis) {
                const pointsCount = categoryAxis.categoriesCount() *
                    (!currentChart.options.isStacked && inArray(firstSeries.type, [ COLUMN, VERTICAL_BULLET ]) ? currentChart.seriesOptions.length : 1);

                total = Math.max(total, pointsCount);
            }
        }

        let size = total * options.pointWidth;
        if (size > 0) {
            size += margin.left + margin.right;
        }

        return size;
    }

    _createSharedTooltip(options) {
        return new SharedTooltip(this._plotArea, options);
    }

    static normalizeOptions(userOptions) {
        let options = wrapNumber(userOptions);

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
    }
}

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