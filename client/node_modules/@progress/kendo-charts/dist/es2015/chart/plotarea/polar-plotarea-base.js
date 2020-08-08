import PlotAreaBase from './plotarea-base';
import AxisGroupRangeTracker from '../axis-group-range-tracker';
import { RadarLogarithmicAxis, RadarNumericAxis } from '../../core';

import { LOGARITHMIC } from '../constants';

import { getSpacing } from '../../common';
import { Y, CENTER } from '../../common/constants';

const DEFAULT_PADDING = 0.15;

class PolarPlotAreaBase extends PlotAreaBase {
    initFields() {
        this.valueAxisRangeTracker = new AxisGroupRangeTracker();
    }

    render() {
        this.addToLegend(this.series);
        this.createPolarAxis();
        this.createCharts();
        this.createValueAxis();
    }

    alignAxes() {
        const axis = this.valueAxis;
        const range = axis.range();
        const crossingValue = axis.options.reverse ? range.max : range.min;
        const slot = axis.getSlot(crossingValue);
        const center = this.polarAxis.getSlot(0).center;
        const axisBox = axis.box.translate(
            center.x - slot.x1,
            center.y - slot.y1
        );

        axis.reflow(axisBox);
    }

    createValueAxis() {
        const tracker = this.valueAxisRangeTracker;
        const defaultRange = tracker.query();
        const axisOptions = this.valueAxisOptions({
            roundToMajorUnit: false,
            zIndex: -1
        });
        let axisType, axisDefaultRange;

        if (axisOptions.type === LOGARITHMIC) {
            axisType = RadarLogarithmicAxis;
            axisDefaultRange = { min: 0.1, max: 1 };
        } else {
            axisType = RadarNumericAxis;
            axisDefaultRange = { min: 0, max: 1 };
        }

        const range = tracker.query(name) || defaultRange || axisDefaultRange;

        if (range && defaultRange) {
            range.min = Math.min(range.min, defaultRange.min);
            range.max = Math.max(range.max, defaultRange.max);
        }

        const valueAxis = new axisType(
            range.min, range.max,
            axisOptions,
            this.chartService
        );

        this.valueAxis = valueAxis;
        this.appendAxis(valueAxis);
    }

    reflowAxes() {
        const { options: { plotArea: options }, valueAxis, polarAxis, box } = this;
        const defaultPadding = Math.min(box.width(), box.height()) * DEFAULT_PADDING;
        const padding = getSpacing(options.padding || {}, defaultPadding);
        const paddingBox = box.clone().unpad(padding);
        const axisBox = paddingBox.clone();

        axisBox.y2 = axisBox.y1 + Math.min(axisBox.width(), axisBox.height());
        axisBox.align(paddingBox, Y, CENTER);

        const valueAxisBox = axisBox.clone().shrink(0, axisBox.height() / 2);

        polarAxis.reflow(axisBox);
        valueAxis.reflow(valueAxisBox);
        const heightDiff = valueAxis.lineBox().height() - valueAxis.box.height();
        valueAxis.reflow(valueAxis.box.unpad({ top: heightDiff }));

        this.axisBox = axisBox;
        this.alignAxes(axisBox);
    }

    backgroundBox() {
        return this.box;
    }

    detachLabels() {}
}

export default PolarPlotAreaBase;
