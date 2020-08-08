
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

var MIN_VALUE_RANGE = Math.pow(10, -DEFAULT_PRECISION + 1);

var NumericAxis = (function (Axis) {
    function NumericAxis(seriesMin, seriesMax, options, chartService) {
        Axis.call(this, Object.assign({}, options, {
            seriesMin: seriesMin,
            seriesMax: seriesMax
        }), chartService);
    }

    if ( Axis ) NumericAxis.__proto__ = Axis;
    NumericAxis.prototype = Object.create( Axis && Axis.prototype );
    NumericAxis.prototype.constructor = NumericAxis;

    NumericAxis.prototype.initUserOptions = function initUserOptions (options) {
        var autoOptions = autoAxisOptions(options.seriesMin, options.seriesMax, options);
        this.totalOptions = totalAxisOptions(autoOptions, options);

        return axisOptions(autoOptions, options);
    };

    NumericAxis.prototype.initFields = function initFields () {
        this.totalMin = this.totalOptions.min;
        this.totalMax = this.totalOptions.max;
        this.totalMajorUnit = this.totalOptions.majorUnit;
        this.seriesMin = this.options.seriesMin;
        this.seriesMax = this.options.seriesMax;
    };

    NumericAxis.prototype.clone = function clone () {
        return new NumericAxis(
            this.seriesMin,
            this.seriesMax,
            Object.assign({}, this.options),
            this.chartService
        );
    };

    NumericAxis.prototype.startValue = function startValue () {
        return 0;
    };

    NumericAxis.prototype.range = function range () {
        var options = this.options;
        return { min: options.min, max: options.max };
    };

    NumericAxis.prototype.getDivisions = function getDivisions (stepValue) {
        if (stepValue === 0) {
            return 1;
        }

        var options = this.options;
        var range = options.max - options.min;

        return Math.floor(round(range / stepValue, COORD_PRECISION)) + 1;
    };

    NumericAxis.prototype.getTickPositions = function getTickPositions (unit, skipUnit) {
        var options = this.options;
        var vertical = options.vertical;
        var reverse = options.reverse;
        var lineBox = this.lineBox();
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var range = options.max - options.min;
        var scale = lineSize / range;
        var step = unit * scale;
        var divisions = this.getDivisions(unit);
        var dir = (vertical ? -1 : 1) * (reverse ? -1 : 1);
        var startEdge = dir === 1 ? 1 : 2;
        var positions = [];
        var pos = lineBox[(vertical ? Y : X) + startEdge];
        var skipStep = 0;

        if (skipUnit) {
            skipStep = skipUnit / unit;
        }

        for (var idx = 0; idx < divisions; idx++) {
            if (idx % skipStep !== 0) {
                positions.push(round(pos, COORD_PRECISION));
            }

            pos = pos + step * dir;
        }

        return positions;
    };

    NumericAxis.prototype.getMajorTickPositions = function getMajorTickPositions () {
        return this.getTickPositions(this.options.majorUnit);
    };

    NumericAxis.prototype.getMinorTickPositions = function getMinorTickPositions () {
        return this.getTickPositions(this.options.minorUnit);
    };

    NumericAxis.prototype.getSlot = function getSlot (a, b, limit) {
        if ( limit === void 0 ) limit = false;

        var options = this.options;
        var vertical = options.vertical;
        var reverse = options.reverse;
        var valueAxis = vertical ? Y : X;
        var lineBox = this.lineBox();
        var lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var dir = reverse ? -1 : 1;
        var step = dir * (lineSize / (options.max - options.min));
        var slotBox = new Box(lineBox.x1, lineBox.y1, lineBox.x1, lineBox.y1);

        var start = a;
        var end = b;

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

        var p1, p2;

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
    };

    NumericAxis.prototype.getValue = function getValue (point) {
        var options = this.options;
        var vertical = options.vertical;
        var reverse = options.reverse;
        var max = Number(options.max);
        var min = Number(options.min);
        var valueAxis = vertical ? Y : X;
        var lineBox = this.lineBox();
        var lineStart = lineBox[valueAxis + (reverse ? 2 : 1)];
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var dir = reverse ? -1 : 1;
        var offset = dir * (point[valueAxis] - lineStart);
        var step = (max - min) / lineSize;
        var valueOffset = offset * step;

        if (offset < 0 || offset > lineSize) {
            return null;
        }

        var value = vertical ?
                max - valueOffset :
                min + valueOffset;

        return round(value, DEFAULT_PRECISION);
    };

    NumericAxis.prototype.translateRange = function translateRange (delta) {
        var options = this.options;
        var vertical = options.vertical;
        var reverse = options.reverse;
        var max = options.max;
        var min = options.min;
        var lineBox = this.lineBox();
        var size = vertical ? lineBox.height() : lineBox.width();
        var range = max - min;
        var scale = size / range;
        var offset = round(delta / scale, DEFAULT_PRECISION);

        if ((vertical || reverse) && !(vertical && reverse )) {
            offset = -offset;
        }

        return {
            min: min + offset,
            max: max + offset,
            offset: offset
        };
    };

    NumericAxis.prototype.scaleRange = function scaleRange (delta) {
        var options = this.options;
        var offset = -delta * options.majorUnit;

        return {
            min: options.min - offset,
            max: options.max + offset
        };
    };

    NumericAxis.prototype.labelsCount = function labelsCount () {
        return this.getDivisions(this.options.majorUnit);
    };

    NumericAxis.prototype.createAxisLabel = function createAxisLabel (index, labelOptions) {
        var options = this.options;
        var value = round(options.min + (index * options.majorUnit), DEFAULT_PRECISION);
        var text = this.axisLabelText(value, null, labelOptions);

        return new AxisLabel(value, text, index, null, labelOptions);
    };

    NumericAxis.prototype.shouldRenderNote = function shouldRenderNote (value) {
        var range = this.range();
        return range.min <= value && value <= range.max;
    };

    NumericAxis.prototype.pan = function pan (delta) {
        var range = this.translateRange(delta);
        return this.limitRange(range.min, range.max, this.totalMin, this.totalMax, range.offset);
    };

    NumericAxis.prototype.pointsRange = function pointsRange (start, end) {
        var startValue = this.getValue(start);
        var endValue = this.getValue(end);
        var min = Math.min(startValue, endValue);
        var max = Math.max(startValue, endValue);

        if (this.isValidRange(min, max)) {
            return {
                min: min,
                max: max
            };
        }
    };

    NumericAxis.prototype.zoomRange = function zoomRange (delta) {
        var ref = this;
        var totalMin = ref.totalMin;
        var totalMax = ref.totalMax;
        var newRange = this.scaleRange(delta);
        var min = limitValue(newRange.min, totalMin, totalMax);
        var max = limitValue(newRange.max, totalMin, totalMax);

        if (this.isValidRange(min, max)) {
            return {
                min: min,
                max: max
            };
        }
    };

    NumericAxis.prototype.isValidRange = function isValidRange (min, max) {
        return max - min > MIN_VALUE_RANGE;
    };

    return NumericAxis;
}(Axis));

function autoAxisOptions(seriesMin, seriesMax, options) {
    var narrowRange = options.narrowRange;

    var autoMin = autoAxisMin(seriesMin, seriesMax, narrowRange);
    var autoMax = autoAxisMax(seriesMin, seriesMax, narrowRange);

    var majorUnit = autoMajorUnit(autoMin, autoMax);
    var autoOptions = {
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
    for (var idx = 0; idx < fields.length; idx++) {
        var field = fields[idx];
        if (options[field] === null) {
            options[field] = undefined;
        }
    }
}

function axisOptions(autoOptions, userOptions) {
    var options = userOptions;
    var userSetMin, userSetMax;

    if (userOptions) {
        clearNullValues(userOptions, [ 'min', 'max' ]);

        userSetMin = defined(userOptions.min);
        userSetMax = defined(userOptions.max);

        var userSetLimits = userSetMin || userSetMax;

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

    var result = deepExtend(autoOptions, options);
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
    var remainder = round(Math.abs(value % divisor), DEFAULT_PRECISION);
    var threshold = divisor * (1 - ratio);

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
