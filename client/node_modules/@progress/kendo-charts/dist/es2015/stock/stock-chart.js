import { Chart } from '../chart';

import Navigator from './navigator';
import { DEFAULT_WIDTH } from '../common/constants';
import { addClass, deepExtend, elementSize, grep, setDefaultOptions } from '../common';
import { NAVIGATOR_AXIS, NAVIGATOR_PANE } from './constants';

const AUTO_CATEGORY_WIDTH = 28;

class StockChart extends Chart {

    applyDefaults(options, themeOptions) {
        const width = elementSize(this.element).width || DEFAULT_WIDTH;
        let theme = themeOptions;

        const stockDefaults = {
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

        super.applyDefaults(options, theme);
    }

    _setElementClass(element) {
        addClass(element, 'k-chart k-stockchart');
    }

    setOptions(options) {
        this.destroyNavigator();
        super.setOptions(options);
    }

    noTransitionsRedraw() {
        const transitions = this.options.transitions;

        this.options.transitions = false;
        this._fullRedraw();
        this.options.transitions = transitions;
    }

    _resize() {
        this.noTransitionsRedraw();
    }

    _redraw() {
        const navigator = this.navigator;

        if (!this._dirty() && navigator && navigator.options.partialRedraw) {
            navigator.redrawSlaves();
        } else {
            this._fullRedraw();
        }
    }

    _dirty() {
        const options = this.options;
        const series = [].concat(options.series, options.navigator.series);
        const seriesCount = grep(series, function(s) { return s && s.visible; }).length;
        const dirty = this._seriesCount !== seriesCount;
        this._seriesCount = seriesCount;

        return dirty;
    }

    _fullRedraw() {
        let navigator = this.navigator;

        if (!navigator) {
            navigator = this.navigator = new Navigator(this);
            this.trigger("navigatorCreated", { navigator: navigator });
        }

        navigator.clean();
        navigator.setRange();

        super._redraw();

        navigator.initSelection();
    }

    _trackSharedTooltip(coords) {
        const plotArea = this._plotArea;
        const pane = plotArea.paneByPoint(coords);

        if (pane && pane.options.name === NAVIGATOR_PANE) {
            this._unsetActivePoint();
        } else {
            super._trackSharedTooltip(coords);
        }
    }

    bindCategories() {
        super.bindCategories();
        this.copyNavigatorCategories();
    }

    copyNavigatorCategories() {
        const definitions = [].concat(this.options.categoryAxis);
        let categories;

        for (let axisIx = 0; axisIx < definitions.length; axisIx++) {
            const axis = definitions[axisIx];
            if (axis.name === NAVIGATOR_AXIS) {
                categories = axis.categories;
            } else if (categories && axis.pane === NAVIGATOR_PANE) {
                axis.categories = categories;
            }
        }
    }

    destroyNavigator() {
        if (this.navigator) {
            this.navigator.destroy();
            this.navigator = null;
        }
    }

    destroy() {
        this.destroyNavigator();
        super.destroy();
    }

    _stopChartHandlers(e) {
        const coords = this._eventCoordinates(e);
        const pane = this._plotArea.paneByPoint(coords);

        return super._stopChartHandlers(e) || (pane && pane.options.name === NAVIGATOR_PANE);
    }

    _toggleDragZoomEvents() {
        if (!this._dragZoomEnabled) {
            this.element.style.touchAction = "none";

            this._dragZoomEnabled = true;
        }
    }
}

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