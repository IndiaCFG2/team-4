import Axis from './axis';
import NumericAxis from './numeric-axis';
import AxisLabel from './axis-label';
import { DateLabelFormats } from './constants';

import { BLACK, DATE, COORD_PRECISION, DEFAULT_PRECISION, X, Y } from '../common/constants';
import { setDefaultOptions, deepExtend, limitValue, round } from '../common';

import autoMajorUnit from './utils/auto-major-unit';
import ceil from './utils/ceil';

import { toDate, toTime, floorDate, ceilDate, duration, addDuration, addTicks, dateDiff, absoluteDateDiff, dateComparer, parseDate, parseDates } from '../date-utils';
import { HOURS, DAYS, WEEKS, MONTHS, YEARS, TIME_PER_DAY, TIME_PER_WEEK, TIME_PER_MONTH, TIME_PER_YEAR, TIME_PER_UNIT } from '../date-utils/constants';

var DateValueAxis = (function (Axis) {
    function DateValueAxis(seriesMin, seriesMax, axisOptions, chartService) {
        var min = toDate(seriesMin);
        var max = toDate(seriesMax);

        var intlService = chartService.intl;
        var options = axisOptions || {};
        options = deepExtend(options || {}, {
            min: parseDate(intlService, options.min),
            max: parseDate(intlService, options.max),
            axisCrossingValue: parseDates(intlService, options.axisCrossingValues || options.axisCrossingValue)
        });
        options = applyDefaults(min, max, options);

        Axis.call(this, options, chartService);

        this.intlService = intlService;
        this.seriesMin = min;
        this.seriesMax = max;

        var weekStartDay = options.weekStartDay || 0;
        this.totalMin = toTime(floorDate(toTime(min) - 1, options.baseUnit, weekStartDay));
        this.totalMax = toTime(ceilDate(toTime(max) + 1, options.baseUnit, weekStartDay));
    }

    if ( Axis ) DateValueAxis.__proto__ = Axis;
    DateValueAxis.prototype = Object.create( Axis && Axis.prototype );
    DateValueAxis.prototype.constructor = DateValueAxis;

    DateValueAxis.prototype.clone = function clone () {
        return new DateValueAxis(this.seriesMin, this.seriesMax, Object.assign({}, this.options), this.chartService);
    };

    DateValueAxis.prototype.range = function range () {
        var options = this.options;
        return { min: options.min, max: options.max };
    };

    DateValueAxis.prototype.getDivisions = function getDivisions (stepValue) {
        var options = this.options;

        return Math.floor(
            duration(options.min, options.max, options.baseUnit) / stepValue + 1
        );
    };

    DateValueAxis.prototype.getTickPositions = function getTickPositions (step) {
        var options = this.options;
        var vertical = options.vertical;
        var lineBox = this.lineBox();
        var dir = (vertical ? -1 : 1) * (options.reverse ? -1 : 1);
        var startEdge = dir === 1 ? 1 : 2;
        var start = lineBox[(vertical ? Y : X) + startEdge];
        var divisions = this.getDivisions(step);
        var timeRange = dateDiff(options.max, options.min);
        var lineSize = vertical ? lineBox.height() : lineBox.width();
        var scale = lineSize / timeRange;
        var weekStartDay = options.weekStartDay || 0;

        var positions = [ start ];
        for (var i = 1; i < divisions; i++) {
            var date = addDuration(options.min, i * step, options.baseUnit, weekStartDay);
            var pos = start + dateDiff(date, options.min) * scale * dir;

            positions.push(round(pos, COORD_PRECISION));
        }

        return positions;
    };

    DateValueAxis.prototype.getMajorTickPositions = function getMajorTickPositions () {
        return this.getTickPositions(this.options.majorUnit);
    };

    DateValueAxis.prototype.getMinorTickPositions = function getMinorTickPositions () {
        return this.getTickPositions(this.options.minorUnit);
    };

    DateValueAxis.prototype.getSlot = function getSlot (a, b, limit) {
        return NumericAxis.prototype.getSlot.call(
            this, parseDate(this.intlService, a), parseDate(this.intlService, b), limit
        );
    };

    DateValueAxis.prototype.getValue = function getValue (point) {
        var value = NumericAxis.prototype.getValue.call(this, point);

        return value !== null ? toDate(value) : null;
    };

    DateValueAxis.prototype.labelsCount = function labelsCount () {
        return this.getDivisions(this.options.majorUnit);
    };

    DateValueAxis.prototype.createAxisLabel = function createAxisLabel (index, labelOptions) {
        var options = this.options;
        var offset = index * options.majorUnit;
        var weekStartDay = options.weekStartDay || 0;
        var date = options.min;

        if (offset > 0) {
            date = addDuration(date, offset, options.baseUnit, weekStartDay);
        }

        var unitFormat = labelOptions.dateFormats[options.baseUnit];
        labelOptions.format = labelOptions.format || unitFormat;

        var text = this.axisLabelText(date, null, labelOptions);
        return new AxisLabel(date, text, index, null, labelOptions);
    };

    DateValueAxis.prototype.translateRange = function translateRange (delta, exact) {
        var options = this.options;
        var baseUnit = options.baseUnit;
        var weekStartDay = options.weekStartDay || 0;
        var lineBox = this.lineBox();
        var size = options.vertical ? lineBox.height() : lineBox.width();
        var range = this.range();
        var scale = size / dateDiff(range.max, range.min);
        var offset = round(delta / scale, DEFAULT_PRECISION) * (options.reverse ? -1 : 1);
        var from = addTicks(options.min, offset);
        var to = addTicks(options.max, offset);

        if (!exact) {
            from = addDuration(from, 0, baseUnit, weekStartDay);
            to = addDuration(to, 0, baseUnit, weekStartDay);
        }

        return {
            min: from,
            max: to,
            offset: offset
        };
    };

    DateValueAxis.prototype.scaleRange = function scaleRange (delta) {
        var ref = this.options;
        var from = ref.min;
        var to = ref.max;
        var rounds = Math.abs(delta);

        while (rounds--) {
            var range = dateDiff(from, to);
            var step = Math.round(range * 0.1);
            if (delta < 0) {
                from = addTicks(from, step);
                to = addTicks(to, -step);
            } else {
                from = addTicks(from, -step);
                to = addTicks(to, step);
            }
        }

        return { min: from, max: to };
    };

    DateValueAxis.prototype.shouldRenderNote = function shouldRenderNote (value) {
        var range = this.range();

        return dateComparer(value, range.min) >= 0 && dateComparer(value, range.max) <= 0;
    };

    DateValueAxis.prototype.pan = function pan (delta) {
        var range = this.translateRange(delta, true);
        var limittedRange = this.limitRange(toTime(range.min), toTime(range.max), this.totalMin, this.totalMax, range.offset);

        if (limittedRange) {
            return {
                min: toDate(limittedRange.min),
                max: toDate(limittedRange.max)
            };
        }
    };

    DateValueAxis.prototype.pointsRange = function pointsRange (start, end) {
        var startValue = this.getValue(start);
        var endValue = this.getValue(end);
        var min = Math.min(startValue, endValue);
        var max = Math.max(startValue, endValue);

        return {
            min: toDate(min),
            max: toDate(max)
        };
    };

    DateValueAxis.prototype.zoomRange = function zoomRange (delta) {
        var range = this.scaleRange(delta);
        var min = toDate(limitValue(toTime(range.min), this.totalMin, this.totalMax));
        var max = toDate(limitValue(toTime(range.max), this.totalMin, this.totalMax));

        return {
            min: min,
            max: max
        };
    };

    return DateValueAxis;
}(Axis));

function timeUnits(delta) {
    var unit = HOURS;

    if (delta >= TIME_PER_YEAR) {
        unit = YEARS;
    } else if (delta >= TIME_PER_MONTH) {
        unit = MONTHS;
    } else if (delta >= TIME_PER_WEEK) {
        unit = WEEKS;
    } else if (delta >= TIME_PER_DAY) {
        unit = DAYS;
    }

    return unit;
}

function applyDefaults(seriesMin, seriesMax, options) {
    var min = options.min || seriesMin;
    var max = options.max || seriesMax;
    var baseUnit = options.baseUnit || (max && min ? timeUnits(absoluteDateDiff(max, min)) : HOURS);
    var baseUnitTime = TIME_PER_UNIT[baseUnit];
    var weekStartDay = options.weekStartDay || 0;
    var autoMin = floorDate(toTime(min) - 1, baseUnit, weekStartDay) || toDate(max);
    var autoMax = ceilDate(toTime(max) + 1, baseUnit, weekStartDay);
    var userMajorUnit = options.majorUnit ? options.majorUnit : undefined;
    var majorUnit = userMajorUnit || ceil(
                        autoMajorUnit(autoMin.getTime(), autoMax.getTime()),
                        baseUnitTime
                    ) / baseUnitTime;
    var actualUnits = duration(autoMin, autoMax, baseUnit);
    var totalUnits = ceil(actualUnits, majorUnit);
    var unitsToAdd = totalUnits - actualUnits;
    var head = Math.floor(unitsToAdd / 2);
    var tail = unitsToAdd - head;

    if (!options.baseUnit) {
        delete options.baseUnit;
    }

    options.baseUnit = options.baseUnit || baseUnit;
    options.min = options.min || addDuration(autoMin, -head, baseUnit, weekStartDay);
    options.max = options.max || addDuration(autoMax, tail, baseUnit, weekStartDay);
    options.minorUnit = options.minorUnit || majorUnit / 5;
    options.majorUnit = majorUnit;

    return options;
}

setDefaultOptions(DateValueAxis, {
    type: DATE,
    majorGridLines: {
        visible: true,
        width: 1,
        color: BLACK
    },
    labels: {
        dateFormats: DateLabelFormats
    }
});

export default DateValueAxis;
