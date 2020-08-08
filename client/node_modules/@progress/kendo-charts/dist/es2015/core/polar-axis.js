import { geometry as geom } from '@progress/kendo-drawing';

import GridLinesMixin from './mixins/grid-lines-mixin';
import RadarCategoryAxis from './radar-category-axis';
import NumericAxis from './numeric-axis';
import Axis from './axis';
import Ring from './ring';
import Box from './box';

import { BLACK } from '../common/constants';
import { deepExtend, deg, getSpacing, inArray, limitValue, setDefaultOptions } from '../common';

class PolarAxis extends Axis {
    constructor(options, chartService) {
        super(options, chartService);

        const instanceOptions = this.options;

        instanceOptions.minorUnit = instanceOptions.minorUnit || instanceOptions.majorUnit / 2;
    }

    getDivisions(stepValue) {
        return NumericAxis.prototype.getDivisions.call(this, stepValue) - 1;
    }

    reflow(box) {
        this.box = box;
        this.reflowLabels();
    }

    reflowLabels() {
        const { options, labels, options: { labels: labelOptions } } = this;
        const skip = labelOptions.skip || 0;
        const step = labelOptions.step || 1;

        const measureBox = new Box();
        const divs = this.intervals(options.majorUnit, skip, step);

        for (let i = 0; i < labels.length; i++) {
            labels[i].reflow(measureBox);
            const labelBox = labels[i].box;

            labels[i].reflow(this.getSlot(divs[i]).adjacentBox(0, labelBox.width(), labelBox.height()));
        }
    }

    lineBox() {
        return this.box;
    }

    intervals(size, skipOption, stepOption, skipAngles = false) {
        const min = this.options.min;
        const divisions = this.getDivisions(size);
        const divs = [];
        const skip = skipOption || 0;
        const step = stepOption || 1;

        for (let i = skip; i < divisions; i += step) {
            const current = (360 + min + i * size) % 360;
            if (!(skipAngles && inArray(current, skipAngles))) {
                divs.push(current);
            }
        }

        return divs;
    }

    majorIntervals() {
        return this.intervals(this.options.majorUnit);
    }

    minorIntervals() {
        return this.intervals(this.options.minorUnit);
    }

    intervalAngle(i) {
        return (540 - i - this.options.startAngle) % 360;
    }

    createLine() {
        return [];
    }

    majorGridLineAngles(altAxis) {
        const majorGridLines = this.options.majorGridLines;
        return this.gridLineAngles(altAxis, this.options.majorUnit, majorGridLines.skip, majorGridLines.step);
    }

    minorGridLineAngles(altAxis, skipMajor) {
        const options = this.options;
        const { minorGridLines, majorGridLines } = options;
        const majorGridLineAngles = skipMajor ? this.intervals(options.majorUnit, majorGridLines.skip, majorGridLines.step) : null;

        return this.gridLineAngles(altAxis, options.minorUnit, minorGridLines.skip, minorGridLines.step, majorGridLineAngles);
    }

    plotBandSlot(band) {
        return this.getSlot(band.from, band.to);
    }

    getSlot(a, b) {
        const { options, box } = this;
        const startAngle = options.startAngle;
        let start = limitValue(a, options.min, options.max);
        let end = limitValue(b || start, start, options.max);

        if (options.reverse) {
            start *= -1;
            end *= -1;
        }

        start = (540 - start - startAngle) % 360;
        end = (540 - end - startAngle) % 360;

        if (end < start) {
            const tmp = start;
            start = end;
            end = tmp;
        }

        return new Ring(box.center(), 0, box.height() / 2, start, end - start);
    }

    slot(from, to = from) {
        const options = this.options;
        const start = 360 - options.startAngle;
        const slot = this.getSlot(from, to);
        const min = Math.min(from, to);
        const max = Math.max(from, to);
        let startAngle, endAngle;

        if (options.reverse) {
            startAngle = min;
            endAngle = max;
        } else {
            startAngle = 360 - max;
            endAngle = 360 - min;
        }

        startAngle = (startAngle + start) % 360;
        endAngle = (endAngle + start) % 360;

        return new geom.Arc([ slot.center.x, slot.center.y ], {
            startAngle: startAngle,
            endAngle: endAngle,
            radiusX: slot.radius,
            radiusY: slot.radius
        });
    }

    getValue(point) {
        const options = this.options;
        const center = this.box.center();
        const dx = point.x - center.x;
        const dy = point.y - center.y;
        let theta = Math.round(deg(Math.atan2(dy, dx)));
        let start = options.startAngle;

        if (!options.reverse) {
            theta *= -1;
            start *= -1;
        }

        return (theta + start + 360) % 360;
    }

    valueRange() {
        return {
            min: 0,
            max: Math.PI * 2
        };
    }
}

setDefaultOptions(PolarAxis, {
    type: "polar",
    startAngle: 0,
    reverse: false,
    majorUnit: 60,
    min: 0,
    max: 360,
    labels: {
        margin: getSpacing(10)
    },
    majorGridLines: {
        color: BLACK,
        visible: true,
        width: 1
    },
    minorGridLines: {
        color: "#aaa"
    }
});

deepExtend(PolarAxis.prototype, GridLinesMixin, {
    createPlotBands: RadarCategoryAxis.prototype.createPlotBands,
    majorAngles: RadarCategoryAxis.prototype.majorAngles,
    range: NumericAxis.prototype.range,
    labelsCount: NumericAxis.prototype.labelsCount,
    createAxisLabel: NumericAxis.prototype.createAxisLabel
});

export default PolarAxis;