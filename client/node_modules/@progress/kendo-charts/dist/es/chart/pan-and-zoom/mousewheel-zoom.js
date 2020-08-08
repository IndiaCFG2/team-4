
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend } from '../../common';

var MousewheelZoom = (function (Class) {
    function MousewheelZoom(chart, options) {
        Class.call(this);

        this.chart = chart;
        this.options = deepExtend({}, this.options, options);
    }

    if ( Class ) MousewheelZoom.__proto__ = Class;
    MousewheelZoom.prototype = Object.create( Class && Class.prototype );
    MousewheelZoom.prototype.constructor = MousewheelZoom;

    MousewheelZoom.prototype.updateRanges = function updateRanges (delta) {
        var lock = (this.options.lock || "").toLowerCase();
        var axisRanges = [];
        var axes = this.chart._plotArea.axes;

        for (var idx = 0; idx < axes.length; idx++) {
            var axis = axes[idx];
            var vertical = axis.options.vertical;

            if (!(lock === X && !vertical) && !(lock === Y && vertical) && axis.zoomRange) {
                var range = axis.zoomRange(-delta);

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
    };

    MousewheelZoom.prototype.zoom = function zoom () {
        var axisRanges = this.axisRanges;
        var plotArea = this.chart._plotArea;

        if (axisRanges && axisRanges.length && plotArea.updateAxisOptions) {
            for (var idx = 0; idx < axisRanges.length; idx++) {
                var axisRange = axisRanges[idx];
                plotArea.updateAxisOptions(axisRange.axis, axisRange.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    };

    MousewheelZoom.prototype.destroy = function destroy () {
        delete this.chart;
    };

    return MousewheelZoom;
}(Class));

export default MousewheelZoom;