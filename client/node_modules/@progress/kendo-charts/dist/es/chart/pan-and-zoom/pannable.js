import acceptKey from './accept-key';
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend } from '../../common';

var Pannable = (function (Class) {
    function Pannable(plotArea, options) {
        Class.call(this);

        this.plotArea = plotArea;
        this.options = deepExtend({}, this.options, options);
    }

    if ( Class ) Pannable.__proto__ = Class;
    Pannable.prototype = Object.create( Class && Class.prototype );
    Pannable.prototype.constructor = Pannable;

    Pannable.prototype.start = function start (e) {
        this._active = acceptKey(e, this.options.key);
        return this._active;
    };

    Pannable.prototype.move = function move (e) {
        if (this._active) {
            var axisRanges = this.axisRanges = this._panAxes(e, X).concat(this._panAxes(e, Y));
            if (axisRanges.length) {
                this.axisRanges = axisRanges;
                return toChartAxisRanges(axisRanges);
            }
        }
    };

    Pannable.prototype.end = function end () {
        var active = this._active;
        this._active = false;

        return active;
    };

    Pannable.prototype.pan = function pan () {
        var ref = this;
        var plotArea = ref.plotArea;
        var axisRanges = ref.axisRanges;
        if (axisRanges.length) {
            for (var idx = 0; idx < axisRanges.length; idx++) {
                var range = axisRanges[idx];
                plotArea.updateAxisOptions(range.axis, range.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    };

    Pannable.prototype.destroy = function destroy () {
        delete this.plotArea;
    };

    Pannable.prototype._panAxes = function _panAxes (e, position) {
        var plotArea = this.plotArea;
        var delta = -e[position].delta;
        var lock = (this.options.lock || "").toLowerCase();
        var updatedAxes = [];

        if (delta !== 0 && (lock || "").toLowerCase() !== position) {
            var axes = plotArea.axes;
            for (var idx = 0; idx < axes.length; idx++) {
                var axis = axes[idx];

                if (position === X && !axis.options.vertical || position === Y && axis.options.vertical) {
                    var range = axis.pan(delta);

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
    };

    return Pannable;
}(Class));

Pannable.prototype.options = {
    key: "none",
    lock: "none"
};

export default Pannable;