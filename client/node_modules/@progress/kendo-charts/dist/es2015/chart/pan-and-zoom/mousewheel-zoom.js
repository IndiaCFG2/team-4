
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend } from '../../common';

class MousewheelZoom extends Class {
    constructor(chart, options) {
        super();

        this.chart = chart;
        this.options = deepExtend({}, this.options, options);
    }

    updateRanges(delta) {
        const lock = (this.options.lock || "").toLowerCase();
        const axisRanges = [];
        const axes = this.chart._plotArea.axes;

        for (let idx = 0; idx < axes.length; idx++) {
            const axis = axes[idx];
            const vertical = axis.options.vertical;

            if (!(lock === X && !vertical) && !(lock === Y && vertical) && axis.zoomRange) {
                const range = axis.zoomRange(-delta);

                if (range) {
                    axisRanges.push({
                        axis: axis,
                        range: range
                    });
                }
            }
        }

        this.axisRanges = axisRanges;
        return toChartAxisRanges(axisRanges);
    }

    zoom() {
        const axisRanges = this.axisRanges;
        const plotArea = this.chart._plotArea;

        if (axisRanges && axisRanges.length && plotArea.updateAxisOptions) {
            for (let idx = 0; idx < axisRanges.length; idx++) {
                const axisRange = axisRanges[idx];
                plotArea.updateAxisOptions(axisRange.axis, axisRange.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    }

    destroy() {
        delete this.chart;
    }
}

export default MousewheelZoom;