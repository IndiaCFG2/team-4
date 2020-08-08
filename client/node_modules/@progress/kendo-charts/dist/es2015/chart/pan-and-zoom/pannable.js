import acceptKey from './accept-key';
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend } from '../../common';

class Pannable extends Class {
    constructor(plotArea, options) {
        super();

        this.plotArea = plotArea;
        this.options = deepExtend({}, this.options, options);
    }

    start(e) {
        this._active = acceptKey(e, this.options.key);
        return this._active;
    }

    move(e) {
        if (this._active) {
            const axisRanges = this.axisRanges = this._panAxes(e, X).concat(this._panAxes(e, Y));
            if (axisRanges.length) {
                this.axisRanges = axisRanges;
                return toChartAxisRanges(axisRanges);
            }
        }
    }

    end() {
        const active = this._active;
        this._active = false;

        return active;
    }

    pan() {
        const { plotArea, axisRanges } = this;
        if (axisRanges.length) {
            for (let idx = 0; idx < axisRanges.length; idx++) {
                const range = axisRanges[idx];
                plotArea.updateAxisOptions(range.axis, range.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    }

    destroy() {
        delete this.plotArea;
    }

    _panAxes(e, position) {
        const plotArea = this.plotArea;
        const delta = -e[position].delta;
        const lock = (this.options.lock || "").toLowerCase();
        const updatedAxes = [];

        if (delta !== 0 && (lock || "").toLowerCase() !== position) {
            const axes = plotArea.axes;
            for (let idx = 0; idx < axes.length; idx++) {
                const axis = axes[idx];

                if (position === X && !axis.options.vertical || position === Y && axis.options.vertical) {
                    const range = axis.pan(delta);

                    if (range) {
                        range.limitRange = true;
                        updatedAxes.push({
                            axis: axis,
                            range: range
                        });
                    }
                }
            }
        }

        return updatedAxes;
    }
}

Pannable.prototype.options = {
    key: "none",
    lock: "none"
};

export default Pannable;