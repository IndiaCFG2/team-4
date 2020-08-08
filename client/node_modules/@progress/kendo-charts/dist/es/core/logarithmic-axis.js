
import Axis from './axis';
import AxisLabel from './axis-label';
import Box from './box';

import createAxisTick from './utils/create-axis-tick';
import createAxisGridLine from './utils/create-axis-grid-line';
import limitCoordinate from './utils/limit-coordinate';

import { DEFAULT_PRECISION, BLACK, X, Y } from '../common/constants';
import { deepExtend, defined, inArray, limitValue, round, setDefaultOptions } from '../common';

var DEFAULT_MAJOR_UNIT = 10;

var LogarithmicAxis = (function (Axis) {
    function LogarithmicAxis(seriesMin, seriesMax, options, chartService) {

        var axisOptions = deepExtend({ majorUnit: DEFAULT_MAJOR_UNIT, min: seriesMin, max: seriesMax }, options);
        var base = axisOptions.majorUnit;
        var autoMax = autoAxisMax(seriesMax, base);
        var autoMin = autoAxisMin(seriesMin, seriesMax, axisOptions);
        var range = initRange(autoMin, autoMax, axisOptions, options);

        axisOptions.max = range.max;
        axisOptions.min = range.min;
        axisOptions.minorUnit = options.minorUnit || round(base - 1, DEFAULT_PRECISION);

        Axis.call(this, axisOptions, chartService);

        this.totalMin = defined(options.min) ? Math.min(autoMin, options.min) : autoMin;
        this.totalMax = defined(options.max) ? Math.max(autoMax, options.max) : autoMax;
        this.logMin = round(log(range.min, base), DEFAULT_PRECISION);
        this.logMax = round(log(range.max, base), DEFAULT_PRECISION);
        this.seriesMin = seriesMin;
        this.seriesMax = seriesMax;

        this.createLabels();
    }

    if ( Axis ) LogarithmicAxis.__proto__ = Axis;
    LogarithmicAxis.prototype = Object.create( Axis && Axis.prototype );
    LogarithmicAxis.prototype.constructor = LogarithmicAxis;

    LogarithmicAxis.prototype.clone = function clone () {
        return new LogarithmicAxis(
            this.seriesMin,
            this.seriesMax,
            Object.assign({}, this.options),
            this.chartService
        );
    };

    LogarithmicAxis.prototype.startValue = function startValue () {
        return this.options.min;
    };

    LogarithmicAxis.prototype.getSlot = function getSlot (a, b, limit) {
        var ref = this;
        var options = ref.options;
        var logMin = ref.logMin;
        var logMax = ref.logMax;
        var reverse = options.reverse;
        var vertical = options.vertical;
        var base = options.majorUnit;
        var valueAxis = vertical ? Y : X;
        var lineBox = this.lineBox();
        var lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var dir = reverse ? -1 : 1;
        var step = dir * (lineSize / (logMax - logMin));
        var slotBox = new Box(lineBox.x1, lineBox.y1, lineBox.x1, lineBox.y1);
        var start = a;
        var end = b;

        if (!defined(start)) {
            start = end || 1;
        }

        if (!defined(end)) {
            end = start || 1;
        }

        if (start <= 0 || end <= 0) {
            return null;
        }

        if (limit) {
            start = Math.max(Math.min(start, options.max), options.min);
            end = Math.max(Math.min(end, options.max), options.min);
        }

        start = log(start, base);
        end = log(end, base);

        var p1, p2;

        if (vertical) {
            p1 = logMax - Math.max(start, end);
            p2 = logMax - Math.min(start, end);
        } else {
            p1 = Math.min(start, end) - logMin;
            p2 = Math.max(start, end) - logMin;
        }

        slotBox[valueAxis + 1] = limitCoordinate(lineStart + step * (reverse ? p2 : p1));
        slotBox[valueAxis + 2] = limitCoordinate(lineStart + step * (reverse ? p1 : p2));

        return slotBox;
    };

    LogarithmicAxis.prototype.getValue = function getValue (point) {
        var ref = this;
        var options = ref.options;
        var logMin = ref.logMin;
        var logMax = ref.logMax;
        var reverse = options.reverse;
        var vertical = options.vertical;
        var base = options.majorUnit;
        var lineBox = this.lineBox();
        var dir = vertical === reverse ? 1 : -1;
        var startEdge = dir === 1 ? 1 : 2;
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var step = ((logMax - logMin) / lineSize);
        var valueAxis = vertical ? Y : X;
        var lineStart = lineBox[valueAxis + startEdge];
        var offset = dir * (point[valueAxis] - lineStart);
        var valueOffset = offset * step;

        if (offset < 0 || offset > lineSize) {
            return null;
        }

        var value = logMin + valueOffset;

        return round(Math.pow(base, value), DEFAULT_PRECISION);
    };

    LogarithmicAxis.prototype.range = function range () {
        var options = this.options;
        return { min: options.min, max: options.max };
    };

    LogarithmicAxis.prototype.scaleRange = function scaleRange (delta) {
        var base = this.options.majorUnit;
        var offset = -delta;

        return {
            min: Math.pow(base, this.logMin - offset),
            max: Math.pow(base, this.logMax + offset)
        };
    };

    LogarithmicAxis.prototype.translateRange = function translateRange (delta) {
        var ref = this;
        var options = ref.options;
        var logMin = ref.logMin;
        var logMax = ref.logMax;
        var reverse = options.reverse;
        var vertical = options.vertical;
        var base = options.majorUnit;
        var lineBox = this.lineBox();
        var size = vertical ? lineBox.height() : lineBox.width();
        var scale = size / (logMax - logMin);
        var offset = round(delta / scale, DEFAULT_PRECISION);

        if ((vertical || reverse) && !(vertical && reverse )) {
            offset = -offset;
        }

        return {
            min: Math.pow(base, logMin + offset),
            max: Math.pow(base, logMax + offset),
            offset: offset
        };
    };

    LogarithmicAxis.prototype.labelsCount = function labelsCount () {
        var floorMax = Math.floor(this.logMax);
        var count = Math.floor(floorMax - this.logMin) + 1;

        return count;
    };

    LogarithmicAxis.prototype.getMajorTickPositions = function getMajorTickPositions () {
        var ticks = [];

        this.traverseMajorTicksPositions(function (position) {
            ticks.push(position);
        }, { step: 1, skip: 0 });

        return ticks;
    };

    LogarithmicAxis.prototype.createTicks = function createTicks (lineGroup) {
        var options = this.options;
        var majorTicks = options.majorTicks;
        var minorTicks = options.minorTicks;
        var vertical = options.vertical;
        var mirror = options.labels.mirror;
        var lineBox = this.lineBox();
        var ticks = [];
        var tickLineOptions = {
            // TODO
            // _alignLines: options._alignLines,
            vertical: vertical
        };

        function render(tickPosition, tickOptions) {
            tickLineOptions.tickX = mirror ? lineBox.x2 : lineBox.x2 - tickOptions.size;
            tickLineOptions.tickY = mirror ? lineBox.y1 - tickOptions.size : lineBox.y1;
            tickLineOptions.position = tickPosition;

            lineGroup.append(createAxisTick(tickLineOptions, tickOptions));
        }

        if (majorTicks.visible) {
            this.traverseMajorTicksPositions(render, majorTicks);
        }

        if (minorTicks.visible) {
            this.traverseMinorTicksPositions(render, minorTicks);
        }

        return ticks;
    };

    LogarithmicAxis.prototype.createGridLines = function createGridLines (altAxis) {
        var options = this.options;
        var minorGridLines = options.minorGridLines;
        var majorGridLines = options.majorGridLines;
        var vertical = options.vertical;
        var lineBox = altAxis.lineBox();
        var lineOptions = {
            lineStart: lineBox[vertical ? "x1" : "y1"],
            lineEnd: lineBox[vertical ? "x2" : "y2"],
            vertical: vertical
        };
        var majorTicks = [];

        var container = this.gridLinesVisual();
        function render(tickPosition, gridLine) {
            if (!inArray(tickPosition, majorTicks)) {
                lineOptions.position = tickPosition;
                container.append(createAxisGridLine(lineOptions, gridLine));

                majorTicks.push(tickPosition);
            }
        }

        if (majorGridLines.visible) {
            this.traverseMajorTicksPositions(render, majorGridLines);
        }

        if (minorGridLines.visible) {
            this.traverseMinorTicksPositions(render, minorGridLines);
        }

        return container.children;
    };

    LogarithmicAxis.prototype.traverseMajorTicksPositions = function traverseMajorTicksPositions (callback, tickOptions) {
        var ref = this._lineOptions();
        var lineStart = ref.lineStart;
        var step = ref.step;
        var ref$1 = this;
        var logMin = ref$1.logMin;
        var logMax = ref$1.logMax;

        for (var power = Math.ceil(logMin) + tickOptions.skip; power <= logMax; power += tickOptions.step) {
            var position = round(lineStart + step * (power - logMin), DEFAULT_PRECISION);
            callback(position, tickOptions);
        }
    };

    LogarithmicAxis.prototype.traverseMinorTicksPositions = function traverseMinorTicksPositions (callback, tickOptions) {
        var this$1 = this;

        var ref = this.options;
        var min = ref.min;
        var max = ref.max;
        var minorUnit = ref.minorUnit;
        var base = ref.majorUnit;
        var ref$1 = this._lineOptions();
        var lineStart = ref$1.lineStart;
        var step = ref$1.step;
        var ref$2 = this;
        var logMin = ref$2.logMin;
        var logMax = ref$2.logMax;
        var start = Math.floor(logMin);

        for (var power = start; power < logMax; power++) {
            var minorOptions = this$1._minorIntervalOptions(power);
            for (var idx = tickOptions.skip; idx < minorUnit; idx += tickOptions.step) {
                var value = minorOptions.value + idx * minorOptions.minorStep;
                if (value > max) {
                    break;
                }
                if (value >= min) {
                    var position = round(lineStart + step * (log(value, base) - logMin), DEFAULT_PRECISION);
                    callback(position, tickOptions);
                }
            }
        }
    };

    LogarithmicAxis.prototype.createAxisLabel = function createAxisLabel (index, labelOptions) {
        var power = Math.ceil(this.logMin + index);
        var value = Math.pow(this.options.majorUnit, power);
        var text = this.axisLabelText(value, null, labelOptions);

        return new AxisLabel(value, text, index, null, labelOptions);
    };

    LogarithmicAxis.prototype.shouldRenderNote = function shouldRenderNote (value) {
        var range = this.range();
        return range.min <= value && value <= range.max;
    };

    LogarithmicAxis.prototype.pan = function pan (delta) {
        var range = this.translateRange(delta);
        return this.limitRange(range.min, range.max, this.totalMin, this.totalMax, range.offset);
    };

    LogarithmicAxis.prototype.pointsRange = function pointsRange (start, end) {
        var startValue = this.getValue(start);
        var endValue = this.getValue(end);
        var min = Math.min(startValue, endValue);
        var max = Math.max(startValue, endValue);

        return {
            min: min,
            max: max
        };
    };

    LogarithmicAxis.prototype.zoomRange = function zoomRange (delta) {
        var ref = this;
        var options = ref.options;
        var totalMin = ref.totalMin;
        var totalMax = ref.totalMax;
        var newRange = this.scaleRange(delta);
        var min = limitValue(newRange.min, totalMin, totalMax);
        var max = limitValue(newRange.max, totalMin, totalMax);
        var base = options.majorUnit;
        var acceptOptionsRange = max > min && options.min && options.max && (round(log(options.max, base) - log(options.min, base), DEFAULT_PRECISION) < 1);
        var acceptNewRange = !(options.min === totalMin && options.max === totalMax) && round(log(max, base) - log(min, base), DEFAULT_PRECISION) >= 1;

        if (acceptOptionsRange || acceptNewRange) {
            return {
                min: min,
                max: max
            };
        }
    };

    LogarithmicAxis.prototype._minorIntervalOptions = function _minorIntervalOptions (power) {
        var ref = this.options;
        var minorUnit = ref.minorUnit;
        var base = ref.majorUnit;
        var value = Math.pow(base, power);
        var nextValue = Math.pow(base, power + 1);
        var difference = nextValue - value;
        var minorStep = difference / minorUnit;

        return {
            value: value,
            minorStep: minorStep
        };
    };

    LogarithmicAxis.prototype._lineOptions = function _lineOptions () {
        var ref = this.options;
        var reverse = ref.reverse;
        var vertical = ref.vertical;
        var valueAxis = vertical ? Y : X;
        var lineBox = this.lineBox();
        var dir = vertical === reverse ? 1 : -1;
        var startEdge = dir === 1 ? 1 : 2;
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var step = dir * (lineSize / (this.logMax - this.logMin));
        var lineStart = lineBox[valueAxis + startEdge];

        return {
            step: step,
            lineStart: lineStart,
            lineBox: lineBox
        };
    };

    return LogarithmicAxis;
}(Axis));

function initRange(autoMin, autoMax, axisOptions, options) {
    var min = axisOptions.min;
    var max = axisOptions.max;

    if (defined(axisOptions.axisCrossingValue) && axisOptions.axisCrossingValue <= 0) {
        throwNegativeValuesError();
    }

    if (!defined(options.max)) {
        max = autoMax;
    } else if (options.max <= 0) {
        throwNegativeValuesError();
    }

    if (!defined(options.min)) {
        min = autoMin;
    } else if (options.min <= 0) {
        throwNegativeValuesError();
    }

    return {
        min: min,
        max: max
    };
}

function autoAxisMin(min, max, options) {
    var base = options.majorUnit;
    var autoMin = min;
    if (min <= 0) {
        autoMin = max <= 1 ? Math.pow(base, -2) : 1;
    } else if (!options.narrowRange) {
        autoMin = Math.pow(base, Math.floor(log(min, base)));
    }
    return autoMin;
}

function autoAxisMax(max, base) {
    var logMaxRemainder = round(log(max, base), DEFAULT_PRECISION) % 1;
    var autoMax;
    if (max <= 0) {
        autoMax = base;
    } else if (logMaxRemainder !== 0 && (logMaxRemainder < 0.3 || logMaxRemainder > 0.9)) {
        autoMax = Math.pow(base, log(max, base) + 0.2);
    } else {
        autoMax = Math.pow(base, Math.ceil(log(max, base)));
    }

    return autoMax;
}

function throwNegativeValuesError() {
    throw new Error("Non positive values cannot be used for a logarithmic axis");
}

function log(y, x) {
    return Math.log(y) / Math.log(x);
}

setDefaultOptions(LogarithmicAxis, {
    type: "log",
    majorUnit: DEFAULT_MAJOR_UNIT,
    minorUnit: 1,
    axisCrossingValue: 1,
    vertical: true,
    majorGridLines: {
        visible: true,
        width: 1,
        color: BLACK
    },
    zIndex: 1,
    _deferLabels: true
});

export default LogarithmicAxis;
