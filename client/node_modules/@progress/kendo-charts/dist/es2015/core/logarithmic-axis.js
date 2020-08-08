
import Axis from './axis';
import AxisLabel from './axis-label';
import Box from './box';

import createAxisTick from './utils/create-axis-tick';
import createAxisGridLine from './utils/create-axis-grid-line';
import limitCoordinate from './utils/limit-coordinate';

import { DEFAULT_PRECISION, BLACK, X, Y } from '../common/constants';
import { deepExtend, defined, inArray, limitValue, round, setDefaultOptions } from '../common';

const DEFAULT_MAJOR_UNIT = 10;

class LogarithmicAxis extends Axis {
    constructor(seriesMin, seriesMax, options, chartService) {

        const axisOptions = deepExtend({ majorUnit: DEFAULT_MAJOR_UNIT, min: seriesMin, max: seriesMax }, options);
        const base = axisOptions.majorUnit;
        const autoMax = autoAxisMax(seriesMax, base);
        const autoMin = autoAxisMin(seriesMin, seriesMax, axisOptions);
        const range = initRange(autoMin, autoMax, axisOptions, options);

        axisOptions.max = range.max;
        axisOptions.min = range.min;
        axisOptions.minorUnit = options.minorUnit || round(base - 1, DEFAULT_PRECISION);

        super(axisOptions, chartService);

        this.totalMin = defined(options.min) ? Math.min(autoMin, options.min) : autoMin;
        this.totalMax = defined(options.max) ? Math.max(autoMax, options.max) : autoMax;
        this.logMin = round(log(range.min, base), DEFAULT_PRECISION);
        this.logMax = round(log(range.max, base), DEFAULT_PRECISION);
        this.seriesMin = seriesMin;
        this.seriesMax = seriesMax;

        this.createLabels();
    }

    clone() {
        return new LogarithmicAxis(
            this.seriesMin,
            this.seriesMax,
            Object.assign({}, this.options),
            this.chartService
        );
    }

    startValue() {
        return this.options.min;
    }

    getSlot(a, b, limit) {
        const { options, logMin, logMax } = this;
        const { reverse, vertical, majorUnit: base } = options;
        const valueAxis = vertical ? Y : X;
        const lineBox = this.lineBox();
        const lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const dir = reverse ? -1 : 1;
        const step = dir * (lineSize / (logMax - logMin));
        const slotBox = new Box(lineBox.x1, lineBox.y1, lineBox.x1, lineBox.y1);
        let start = a;
        let end = b;

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

        let p1, p2;

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
    }

    getValue(point) {
        const { options, logMin, logMax } = this;
        const { reverse, vertical, majorUnit: base } = options;
        const lineBox = this.lineBox();
        const dir = vertical === reverse ? 1 : -1;
        const startEdge = dir === 1 ? 1 : 2;
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const step = ((logMax - logMin) / lineSize);
        const valueAxis = vertical ? Y : X;
        const lineStart = lineBox[valueAxis + startEdge];
        const offset = dir * (point[valueAxis] - lineStart);
        const valueOffset = offset * step;

        if (offset < 0 || offset > lineSize) {
            return null;
        }

        const value = logMin + valueOffset;

        return round(Math.pow(base, value), DEFAULT_PRECISION);
    }

    range() {
        const options = this.options;
        return { min: options.min, max: options.max };
    }

    scaleRange(delta) {
        const base = this.options.majorUnit;
        const offset = -delta;

        return {
            min: Math.pow(base, this.logMin - offset),
            max: Math.pow(base, this.logMax + offset)
        };
    }

    translateRange(delta) {
        const { options, logMin, logMax } = this;
        const { reverse, vertical, majorUnit: base } = options;
        const lineBox = this.lineBox();
        const size = vertical ? lineBox.height() : lineBox.width();
        const scale = size / (logMax - logMin);
        let offset = round(delta / scale, DEFAULT_PRECISION);

        if ((vertical || reverse) && !(vertical && reverse )) {
            offset = -offset;
        }

        return {
            min: Math.pow(base, logMin + offset),
            max: Math.pow(base, logMax + offset),
            offset: offset
        };
    }

    labelsCount() {
        const floorMax = Math.floor(this.logMax);
        const count = Math.floor(floorMax - this.logMin) + 1;

        return count;
    }

    getMajorTickPositions() {
        const ticks = [];

        this.traverseMajorTicksPositions((position) => {
            ticks.push(position);
        }, { step: 1, skip: 0 });

        return ticks;
    }

    createTicks(lineGroup) {
        const options = this.options;
        const { majorTicks, minorTicks, vertical } = options;
        const mirror = options.labels.mirror;
        const lineBox = this.lineBox();
        const ticks = [];
        const tickLineOptions = {
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
    }

    createGridLines(altAxis) {
        const options = this.options;
        const { minorGridLines, majorGridLines, vertical } = options;
        const lineBox = altAxis.lineBox();
        const lineOptions = {
            lineStart: lineBox[vertical ? "x1" : "y1"],
            lineEnd: lineBox[vertical ? "x2" : "y2"],
            vertical: vertical
        };
        const majorTicks = [];

        const container = this.gridLinesVisual();
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
    }

    traverseMajorTicksPositions(callback, tickOptions) {
        const { lineStart, step } = this._lineOptions();
        const { logMin, logMax } = this;

        for (let power = Math.ceil(logMin) + tickOptions.skip; power <= logMax; power += tickOptions.step) {
            let position = round(lineStart + step * (power - logMin), DEFAULT_PRECISION);
            callback(position, tickOptions);
        }
    }

    traverseMinorTicksPositions(callback, tickOptions) {
        const { min, max, minorUnit, majorUnit: base } = this.options;
        const { lineStart, step } = this._lineOptions();
        const { logMin, logMax } = this;
        const start = Math.floor(logMin);

        for (let power = start; power < logMax; power++) {
            const minorOptions = this._minorIntervalOptions(power);
            for (let idx = tickOptions.skip; idx < minorUnit; idx += tickOptions.step) {
                const value = minorOptions.value + idx * minorOptions.minorStep;
                if (value > max) {
                    break;
                }
                if (value >= min) {
                    const position = round(lineStart + step * (log(value, base) - logMin), DEFAULT_PRECISION);
                    callback(position, tickOptions);
                }
            }
        }
    }

    createAxisLabel(index, labelOptions) {
        const power = Math.ceil(this.logMin + index);
        const value = Math.pow(this.options.majorUnit, power);
        const text = this.axisLabelText(value, null, labelOptions);

        return new AxisLabel(value, text, index, null, labelOptions);
    }

    shouldRenderNote(value) {
        const range = this.range();
        return range.min <= value && value <= range.max;
    }

    pan(delta) {
        const range = this.translateRange(delta);
        return this.limitRange(range.min, range.max, this.totalMin, this.totalMax, range.offset);
    }

    pointsRange(start, end) {
        const startValue = this.getValue(start);
        const endValue = this.getValue(end);
        const min = Math.min(startValue, endValue);
        const max = Math.max(startValue, endValue);

        return {
            min: min,
            max: max
        };
    }

    zoomRange(delta) {
        const { options, totalMin, totalMax } = this;
        const newRange = this.scaleRange(delta);
        const min = limitValue(newRange.min, totalMin, totalMax);
        const max = limitValue(newRange.max, totalMin, totalMax);
        const base = options.majorUnit;
        const acceptOptionsRange = max > min && options.min && options.max && (round(log(options.max, base) - log(options.min, base), DEFAULT_PRECISION) < 1);
        const acceptNewRange = !(options.min === totalMin && options.max === totalMax) && round(log(max, base) - log(min, base), DEFAULT_PRECISION) >= 1;

        if (acceptOptionsRange || acceptNewRange) {
            return {
                min: min,
                max: max
            };
        }
    }

    _minorIntervalOptions(power) {
        const { minorUnit, majorUnit: base } = this.options;
        const value = Math.pow(base, power);
        const nextValue = Math.pow(base, power + 1);
        const difference = nextValue - value;
        const minorStep = difference / minorUnit;

        return {
            value: value,
            minorStep: minorStep
        };
    }

    _lineOptions() {
        const { reverse, vertical } = this.options;
        const valueAxis = vertical ? Y : X;
        const lineBox = this.lineBox();
        const dir = vertical === reverse ? 1 : -1;
        const startEdge = dir === 1 ? 1 : 2;
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const step = dir * (lineSize / (this.logMax - this.logMin));
        const lineStart = lineBox[valueAxis + startEdge];

        return {
            step: step,
            lineStart: lineStart,
            lineBox: lineBox
        };
    }
}

function initRange(autoMin, autoMax, axisOptions, options) {
    let { min, max } = axisOptions;

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
    const base = options.majorUnit;
    let autoMin = min;
    if (min <= 0) {
        autoMin = max <= 1 ? Math.pow(base, -2) : 1;
    } else if (!options.narrowRange) {
        autoMin = Math.pow(base, Math.floor(log(min, base)));
    }
    return autoMin;
}

function autoAxisMax(max, base) {
    const logMaxRemainder = round(log(max, base), DEFAULT_PRECISION) % 1;
    let autoMax;
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
