import PlotAreaBase from './plotarea-base';
import AxisGroupRangeTracker from '../axis-group-range-tracker';
import { RadarLogarithmicAxis, RadarNumericAxis } from '../../core';

import { LOGARITHMIC } from '../constants';

import { getSpacing } from '../../common';
import { Y, CENTER } from '../../common/constants';

var DEFAULT_PADDING = 0.15;

var PolarPlotAreaBase = (function (PlotAreaBase) {
    function PolarPlotAreaBase () {
        PlotAreaBase.apply(this, arguments);
    }

    if ( PlotAreaBase ) PolarPlotAreaBase.__proto__ = PlotAreaBase;
    PolarPlotAreaBase.prototype = Object.create( PlotAreaBase && PlotAreaBase.prototype );
    PolarPlotAreaBase.prototype.constructor = PolarPlotAreaBase;

    PolarPlotAreaBase.prototype.initFields = function initFields () {
        this.valueAxisRangeTracker = new AxisGroupRangeTracker();
    };

    PolarPlotAreaBase.prototype.render = function render () {
        this.addToLegend(this.series);
        this.createPolarAxis();
        this.createCharts();
        this.createValueAxis();
    };

    PolarPlotAreaBase.prototype.alignAxes = function alignAxes () {
        var axis = this.valueAxis;
        var range = axis.range();
        var crossingValue = axis.options.reverse ? range.max : range.min;
        var slot = axis.getSlot(crossingValue);
        var center = this.polarAxis.getSlot(0).center;
        var axisBox = axis.box.translate(
            center.x - slot.x1,
            center.y - slot.y1
        );

        axis.reflow(axisBox);
    };

    PolarPlotAreaBase.prototype.createValueAxis = function createValueAxis () {
        var tracker = this.valueAxisRangeTracker;
        var defaultRange = tracker.query();
        var axisOptions = this.valueAxisOptions({
            roundToMajorUnit: false,
            zIndex: -1
        });
        var axisType, axisDefaultRange;

        if (axisOptions.type === LOGARITHMIC) {
            axisType = RadarLogarithmicAxis;
            axisDefaultRange = { min: 0.1, max: 1 };
        } else {
            axisType = RadarNumericAxis;
            axisDefaultRange = { min: 0, max: 1 };
        }

        var range = tracker.query(name) || defaultRange || axisDefaultRange;

        if (range && defaultRange) {
            range.min = Math.min(range.min, defaultRange.min);
            range.max = Math.max(range.max, defaultRange.max);
        }

        var valueAxis = new axisType(
            range.min, range.max,
            axisOptions,
            this.chartService
        );

        this.valueAxis = valueAxis;
        this.appendAxis(valueAxis);
    };

    PolarPlotAreaBase.prototype.reflowAxes = function reflowAxes () {
        var ref = this;
        var options = ref.options.plotArea;
        var valueAxis = ref.valueAxis;
        var polarAxis = ref.polarAxis;
        var box = ref.box;
        var defaultPadding = Math.min(box.width(), box.height()) * DEFAULT_PADDING;
        var padding = getSpacing(options.padding || {}, defaultPadding);
        var paddingBox = box.clone().unpad(padding);
        var axisBox = paddingBox.clone();

        axisBox.y2 = axisBox.y1 + Math.min(axisBox.width(), axisBox.height());
        axisBox.align(paddingBox, Y, CENTER);

        var valueAxisBox = axisBox.clone().shrink(0, axisBox.height() / 2);

        polarAxis.reflow(axisBox);
        valueAxis.reflow(valueAxisBox);
        var heightDiff = valueAxis.lineBox().height() - valueAxis.box.height();
        valueAxis.reflow(valueAxis.box.unpad({ top: heightDiff }));

        this.axisBox = axisBox;
        this.alignAxes(axisBox);
    };

    PolarPlotAreaBase.prototype.backgroundBox = function backgroundBox () {
        return this.box;
    };

    PolarPlotAreaBase.prototype.detachLabels = function detachLabels () {};

    return PolarPlotAreaBase;
}(PlotAreaBase));

export default PolarPlotAreaBase;
