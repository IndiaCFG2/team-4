
import Axis from './axis';
import AxisLabel from './axis-label';
import Box from './box';

import { BLACK, DEFAULT_PRECISION, COORD_PRECISION, X, Y } from '../common/constants';
import { deepExtend, defined, limitValue, round, setDefaultOptions } from '../common';

import autoMajorUnit from './utils/auto-major-unit';
import autoAxisMin from './utils/auto-axis-min';
import autoAxisMax from './utils/auto-axis-max';
import floor from './utils/floor';
import ceil from './utils/ceil';
import limitCoordinate from './utils/limit-coordinate';

const MIN_VALUE_RANGE = Math.pow(10, -DEFAULT_PRECISION + 1);

class NumericAxis extends Axis {

    constructor(seriesMin, seriesMax, options, chartService) {
        super(Object.assign({}, options, {
            seriesMin: seriesMin,
            seriesMax: seriesMax
        }), chartService);
    }

    initUserOptions(options) {
        const autoOptions = autoAxisOptions(options.seriesMin, options.seriesMax, options);
        this.totalOptions = totalAxisOptions(autoOptions, options);

        return axisOptions(autoOptions, options);
    }

    initFields() {
        this.totalMin = this.totalOptions.min;
        this.totalMax = this.totalOptions.max;
        this.totalMajorUnit = this.totalOptions.majorUnit;
        this.seriesMin = this.options.seriesMin;
        this.seriesMax = this.options.seriesMax;
    }

    clone() {
        return new NumericAxis(
            this.seriesMin,
            this.seriesMax,
            Object.assign({}, this.options),
            this.chartService
        );
    }

    startValue() {
        return 0;
    }

    range() {
        const options = this.options;
        return { min: options.min, max: options.max };
    }

    getDivisions(stepValue) {
        if (stepValue === 0) {
            return 1;
        }

        const options = this.options;
        const range = options.max - options.min;

        return Math.floor(round(range / stepValue, COORD_PRECISION)) + 1;
    }

    getTickPositions(unit, skipUnit) {
        const options = this.options;
        const { vertical, reverse } = options;
        const lineBox = this.lineBox();
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const range = options.max - options.min;
        const scale = lineSize / range;
        const step = unit * scale;
        const divisions = this.getDivisions(unit);
        const dir = (vertical ? -1 : 1) * (reverse ? -1 : 1);
        const startEdge = dir === 1 ? 1 : 2;
        const positions = [];
        let pos = lineBox[(vertical ? Y : X) + startEdge];
        let skipStep = 0;

        if (skipUnit) {
            skipStep = skipUnit / unit;
        }

        for (let idx = 0; idx < divisions; idx++) {
            if (idx % skipStep !== 0) {
                positions.push(round(pos, COORD_PRECISION));
            }

            pos = pos + step * dir;
        }

        return positions;
    }

    getMajorTickPositions() {
        return this.getTickPositions(this.options.majorUnit);
    }

    getMinorTickPositions() {
        return this.getTickPositions(this.options.minorUnit);
    }

    getSlot(a, b, limit = false) {
        const options = this.options;
        const { vertical, reverse } = options;
        const valueAxis = vertical ? Y : X;
        const lineBox = this.lineBox();
        const lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const dir = reverse ? -1 : 1;
        const step = dir * (lineSize / (options.max - options.min));
        const slotBox = new Box(lineBox.x1, lineBox.y1, lineBox.x1, lineBox.y1);

        let start = a;
        let end = b;

        if (!defined(start)) {
            start = end || 0;
        }

        if (!defined(end)) {
            end = start || 0;
        }

        if (limit) {
            start = Math.max(Math.min(start, options.max), options.min);
            end = Math.max(Math.min(end, options.max), options.min);
        }

        let p1, p2;

        if (vertical) {
            p1 = options.max - Math.max(start, end);
            p2 = options.max - Math.min(start, end);
        } else {
            p1 = Math.min(start, end) - options.min;
            p2 = Math.max(start, end) - options.min;
        }

        slotBox[valueAxis + 1] = limitCoordinate(lineStart + step * (reverse ? p2 : p1));
        slotBox[valueAxis + 2] = limitCoordinate(lineStart + step * (reverse ? p1 : p2));

        return slotBox;
    }

    getValue(point) {
        const options = this.options;
        const { vertical, reverse } = options;
        const max = Number(options.max);
        const min = Number(options.min);
        const valueAxis = vertical ? Y : X;
        const lineBox = this.lineBox();
        const lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const dir = reverse ? -1 : 1;
        const offset = dir * (point[valueAxis] - lineStart);
        const step = (max - min) / lineSize;
        const valueOffset = offset * step;

        if (offset < 0 || offset > lineSize) {
            return null;
        }

        const value = vertical ?
                max - valueOffset :
                min + valueOffset;

        return round(value, DEFAULT_PRECISION);
    }

    translateRange(delta) {
        const options = this.options;
        const { vertical, reverse, max, min } = options;
        const lineBox = this.lineBox();
        const size = vertical ? lineBox.height() : lineBox.width();
        const range = max - min;
        const scale = size / range;
        let offset = round(delta / scale, DEFAULT_PRECISION);

        if ((vertical || reverse) && !(vertical && reverse )) {
            offset = -offset;
        }

        return {
            min: min + offset,
            max: max + offset,
            offset: offset
        };
    }

    scaleRange(delta) {
        const options = this.options;
        const offset = -delta * options.majorUnit;

        return {
            min: options.min - offset,
            max: options.max + offset
        };
    }

    labelsCount() {
        return this.getDivisions(this.options.majorUnit);
    }

    createAxisLabel(index, labelOptions) {
        const options = this.options;
        const value = round(options.min + (index * options.majorUnit), DEFAULT_PRECISION);
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

        if (this.isValidRange(min, max)) {
            return {
                min: min,
                max: max
            };
        }
    }

    zoomRange(delta) {
        const { totalMin, totalMax } = this;
        const newRange = this.scaleRange(delta);
        const min = limitValue(newRange.min, totalMin, totalMax);
        const max = limitValue(newRange.max, totalMin, totalMax);

        if (this.isValidRange(min, max)) {
            return {
                min: min,
                max: max
            };
        }
    }

    isValidRange(min, max) {
        return max - min > MIN_VALUE_RANGE;
    }
}

function autoAxisOptions(seriesMin, seriesMax, options) {
    const narrowRange = options.narrowRange;

    let autoMin = autoAxisMin(seriesMin, seriesMax, narrowRange);
    let autoMax = autoAxisMax(seriesMin, seriesMax, narrowRange);

    const majorUnit = autoMajorUnit(autoMin, autoMax);
    const autoOptions = {
        majorUnit: majorUnit
    };

    if (options.roundToMajorUnit !== false) {
        if (autoMin < 0 && remainderClose(autoMin, majorUnit, 1 / 3)) {
            autoMin -= majorUnit;
        }

        if (autoMax > 0 && remainderClose(autoMax, majorUnit, 1 / 3)) {
            autoMax += majorUnit;
        }
    }

    autoOptions.min = floor(autoMin, majorUnit);
    autoOptions.max = ceil(autoMax, majorUnit);

    return autoOptions;
}

function totalAxisOptions(autoOptions, options) {
    return {
        min: defined(options.min) ? Math.min(autoOptions.min, options.min) : autoOptions.min,
        max: defined(options.max) ? Math.max(autoOptions.max, options.max) : autoOptions.max,
        majorUnit: autoOptions.majorUnit
    };
}

function clearNullValues(options, fields) {
    for (let idx = 0; idx < fields.length; idx++) {
        const field = fields[idx];
        if (options[field] === null) {
            options[field] = undefined;
        }
    }
}

function axisOptions(autoOptions, userOptions) {
    let options = userOptions;
    let userSetMin, userSetMax;

    if (userOptions) {
        clearNullValues(userOptions, [ 'min', 'max' ]);

        userSetMin = defined(userOptions.min);
        userSetMax = defined(userOptions.max);

        const userSetLimits = userSetMin || userSetMax;

        if (userSetLimits) {
            if (userOptions.min === userOptions.max) {
                if (userOptions.min > 0) {
                    userOptions.min = 0;
                } else {
                    userOptions.max = 1;
                }
            }
        }

        if (userOptions.majorUnit) {
            autoOptions.min = floor(autoOptions.min, userOptions.majorUnit);
            autoOptions.max = ceil(autoOptions.max, userOptions.majorUnit);
        } else if (userSetLimits) {
            options = deepExtend(autoOptions, userOptions);

            // Determine an auto major unit after min/max have been set
            autoOptions.majorUnit = autoMajorUnit(options.min, options.max);
        }
    }

    autoOptions.minorUnit = (options.majorUnit || autoOptions.majorUnit) / 5;

    const result = deepExtend(autoOptions, options);
    if (result.min >= result.max) {
        if (userSetMin && !userSetMax) {
            result.max = result.min + result.majorUnit;
        } else if (!userSetMin && userSetMax) {
            result.min = result.max - result.majorUnit;
        }
    }

    return result;
}

function remainderClose(value, divisor, ratio) {
    const remainder = round(Math.abs(value % divisor), DEFAULT_PRECISION);
    const threshold = divisor * (1 - ratio);

    return remainder === 0 || remainder > threshold;
}

setDefaultOptions(NumericAxis, {
    type: "numeric",
    min: 0,
    max: 1,
    vertical: true,
    majorGridLines: {
        visible: true,
        width: 1,
        color: BLACK
    },
    labels: {
        format: "#.####################"
    },
    zIndex: 1
});

export default NumericAxis;
