import { geometry as geom } from '@progress/kendo-drawing';

import GridLinesMixin from './mixins/grid-lines-mixin';
import RadarCategoryAxis from './radar-category-axis';
import NumericAxis from './numeric-axis';
import Axis from './axis';
import Ring from './ring';
import Box from './box';

import { BLACK } from '../common/constants';
import { deepExtend, deg, getSpacing, inArray, limitValue, setDefaultOptions } from '../common';

var PolarAxis = (function (Axis) {
    function PolarAxis(options, chartService) {
        Axis.call(this, options, chartService);

        var instanceOptions = this.options;

        instanceOptions.minorUnit = instanceOptions.minorUnit || instanceOptions.majorUnit / 2;
    }

    if ( Axis ) PolarAxis.__proto__ = Axis;
    PolarAxis.prototype = Object.create( Axis && Axis.prototype );
    PolarAxis.prototype.constructor = PolarAxis;

    PolarAxis.prototype.getDivisions = function getDivisions (stepValue) {
        return NumericAxis.prototype.getDivisions.call(this, stepValue) - 1;
    };

    PolarAxis.prototype.reflow = function reflow (box) {
        this.box = box;
        this.reflowLabels();
    };

    PolarAxis.prototype.reflowLabels = function reflowLabels () {
        var this$1 = this;

        var ref = this;
        var options = ref.options;
        var labels = ref.labels;
        var labelOptions = ref.options.labels;
        var skip = labelOptions.skip || 0;
        var step = labelOptions.step || 1;

        var measureBox = new Box();
        var divs = this.intervals(options.majorUnit, skip, step);

        for (var i = 0; i < labels.length; i++) {
            labels[i].reflow(measureBox);
            var labelBox = labels[i].box;

            labels[i].reflow(this$1.getSlot(divs[i]).adjacentBox(0, labelBox.width(), labelBox.height()));
        }
    };

    PolarAxis.prototype.lineBox = function lineBox () {
        return this.box;
    };

    PolarAxis.prototype.intervals = function intervals (size, skipOption, stepOption, skipAngles) {
        if ( skipAngles === void 0 ) skipAngles = false;

        var min = this.options.min;
        var divisions = this.getDivisions(size);
        var divs = [];
        var skip = skipOption || 0;
        var step = stepOption || 1;

        for (var i = skip; i < divisions; i += step) {
            var current = (360 + min + i * size) % 360;
            if (!(skipAngles && inArray(current, skipAngles))) {
                divs.push(current);
            }
        }

        return divs;
    };

    PolarAxis.prototype.majorIntervals = function majorIntervals () {
        return this.intervals(this.options.majorUnit);
    };

    PolarAxis.prototype.minorIntervals = function minorIntervals () {
        return this.intervals(this.options.minorUnit);
    };

    PolarAxis.prototype.intervalAngle = function intervalAngle (i) {
        return (540 - i - this.options.startAngle) % 360;
    };

    PolarAxis.prototype.createLine = function createLine () {
        return [];
    };

    PolarAxis.prototype.majorGridLineAngles = function majorGridLineAngles (altAxis) {
        var majorGridLines = this.options.majorGridLines;
        return this.gridLineAngles(altAxis, this.options.majorUnit, majorGridLines.skip, majorGridLines.step);
    };

    PolarAxis.prototype.minorGridLineAngles = function minorGridLineAngles (altAxis, skipMajor) {
        var options = this.options;
        var minorGridLines = options.minorGridLines;
        var majorGridLines = options.majorGridLines;
        var majorGridLineAngles = skipMajor ? this.intervals(options.majorUnit, majorGridLines.skip, majorGridLines.step) : null;

        return this.gridLineAngles(altAxis, options.minorUnit, minorGridLines.skip, minorGridLines.step, majorGridLineAngles);
    };

    PolarAxis.prototype.plotBandSlot = function plotBandSlot (band) {
        return this.getSlot(band.from, band.to);
    };

    PolarAxis.prototype.getSlot = function getSlot (a, b) {
        var ref = this;
        var options = ref.options;
        var box = ref.box;
        var startAngle = options.startAngle;
        var start = limitValue(a, options.min, options.max);
        var end = limitValue(b || start, start, options.max);

        if (options.reverse) {
            start *= -1;
            end *= -1;
        }

        start = (540 - start - startAngle) % 360;
        end = (540 - end - startAngle) % 360;

        if (end < start) {
            var tmp = start;
            start = end;
            end = tmp;
        }

        return new Ring(box.center(), 0, box.height() / 2, start, end - start);
    };

    PolarAxis.prototype.slot = function slot (from, to) {
        if ( to === void 0 ) to = from;

        var options = this.options;
        var start = 360 - options.startAngle;
        var slot = this.getSlot(from, to);
        var min = Math.min(from, to);
        var max = Math.max(from, to);
        var startAngle, endAngle;

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
    };

    PolarAxis.prototype.getValue = function getValue (point) {
        var options = this.options;
        var center = this.box.center();
        var dx = point.x - center.x;
        var dy = point.y - center.y;
        var theta = Math.round(deg(Math.atan2(dy, dx)));
        var start = options.startAngle;

        if (!options.reverse) {
            theta *= -1;
            start *= -1;
        }

        return (theta + start + 360) % 360;
    };

    PolarAxis.prototype.valueRange = function valueRange () {
        return {
            min: 0,
            max: Math.PI * 2
        };
    };

    return PolarAxis;
}(Axis));

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