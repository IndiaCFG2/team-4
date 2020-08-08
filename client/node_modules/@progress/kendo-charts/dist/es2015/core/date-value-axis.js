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

class DateValueAxis extends Axis {
    constructor(seriesMin, seriesMax, axisOptions, chartService) {
        const min = toDate(seriesMin);
        const max = toDate(seriesMax);

        const intlService = chartService.intl;
        let options = axisOptions || {};
        options = deepExtend(options || {}, {
            min: parseDate(intlService, options.min),
            max: parseDate(intlService, options.max),
            axisCrossingValue: parseDates(intlService, options.axisCrossingValues || options.axisCrossingValue)
        });
        options = applyDefaults(min, max, options);

        super(options, chartService);

        this.intlService = intlService;
        this.seriesMin = min;
        this.seriesMax = max;

        const weekStartDay = options.weekStartDay || 0;
        this.totalMin = toTime(floorDate(toTime(min) - 1, options.baseUnit, weekStartDay));
        this.totalMax = toTime(ceilDate(toTime(max) + 1, options.baseUnit, weekStartDay));
    }

    clone() {
        return new DateValueAxis(this.seriesMin, this.seriesMax, Object.assign({}, this.options), this.chartService);
    }

    range() {
        const options = this.options;
        return { min: options.min, max: options.max };
    }

    getDivisions(stepValue) {
        const options = this.options;

        return Math.floor(
            duration(options.min, options.max, options.baseUnit) / stepValue + 1
        );
    }

    getTickPositions(step) {
        const options = this.options;
        const vertical = options.vertical;
        const lineBox = this.lineBox();
        const dir = (vertical ? -1 : 1) * (options.reverse ? -1 : 1);
        const startEdge = dir === 1 ? 1 : 2;
        const start = lineBox[(vertical ? Y : X) + startEdge];
        const divisions = this.getDivisions(step);
        const timeRange = dateDiff(options.max, options.min);
        const lineSize = vertical ? lineBox.height() : lineBox.width();
        const scale = lineSize / timeRange;
        const weekStartDay = options.weekStartDay || 0;

        const positions = [ start ];
        for (let i = 1; i < divisions; i++) {
            const date = addDuration(options.min, i * step, options.baseUnit, weekStartDay);
            const pos = start + dateDiff(date, options.min) * scale * dir;

            positions.push(round(pos, COORD_PRECISION));
        }

        return positions;
    }

    getMajorTickPositions() {
        return this.getTickPositions(this.options.majorUnit);
    }

    getMinorTickPositions() {
        return this.getTickPositions(this.options.minorUnit);
    }

    getSlot(a, b, limit) {
        return NumericAxis.prototype.getSlot.call(
            this, parseDate(this.intlService, a), parseDate(this.intlService, b), limit
        );
    }

    getValue(point) {
        const value = NumericAxis.prototype.getValue.call(this, point);

        return value !== null ? toDate(value) : null;
    }

    labelsCount() {
        return this.getDivisions(this.options.majorUnit);
    }

    createAxisLabel(index, labelOptions) {
        const options = this.options;
        const offset = index * options.majorUnit;
        const weekStartDay = options.weekStartDay || 0;
        let date = options.min;

        if (offset > 0) {
            date = addDuration(date, offset, options.baseUnit, weekStartDay);
        }

        const unitFormat = labelOptions.dateFormats[options.baseUnit];
        labelOptions.format = labelOptions.format || unitFormat;

        const text = this.axisLabelText(date, null, labelOptions);
        return new AxisLabel(date, text, index, null, labelOptions);
    }

    translateRange(delta, exact) {
        const options = this.options;
        const baseUnit = options.baseUnit;
        const weekStartDay = options.weekStartDay || 0;
        const lineBox = this.lineBox();
        const size = options.vertical ? lineBox.height() : lineBox.width();
        const range = this.range();
        const scale = size / dateDiff(range.max, range.min);
        const offset = round(delta / scale, DEFAULT_PRECISION) * (options.reverse ? -1 : 1);
        let from = addTicks(options.min, offset);
        let to = addTicks(options.max, offset);

        if (!exact) {
            from = addDuration(from, 0, baseUnit, weekStartDay);
            to = addDuration(to, 0, baseUnit, weekStartDay);
        }

        return {
            min: from,
            max: to,
            offset: offset
        };
    }

    scaleRange(delta) {
        let { min: from, max: to } = this.options;
        let rounds = Math.abs(delta);

        while (rounds--) {
            const range = dateDiff(from, to);
            const step = Math.round(range * 0.1);
            if (delta < 0) {
                from = addTicks(from, step);
                to = addTicks(to, -step);
            } else {
                from = addTicks(from, -step);
                to = addTicks(to, step);
            }
        }

        return { min: from, max: to };
    }

    shouldRenderNote(value) {
        const range = this.range();

        return dateComparer(value, range.min) >= 0 && dateComparer(value, range.max) <= 0;
    }

    pan(delta) {
        const range = this.translateRange(delta, true);
        const limittedRange = this.limitRange(toTime(range.min), toTime(range.max), this.totalMin, this.totalMax, range.offset);

        if (limittedRange) {
            return {
                min: toDate(limittedRange.min),
                max: toDate(limittedRange.max)
            };
        }
    }

    pointsRange(start, end) {
        const startValue = this.getValue(start);
        const endValue = this.getValue(end);
        const min = Math.min(startValue, endValue);
        const max = Math.max(startValue, endValue);

        return {
            min: toDate(min),
            max: toDate(max)
        };
    }

    zoomRange(delta) {
        const range = this.scaleRange(delta);
        const min = toDate(limitValue(toTime(range.min), this.totalMin, this.totalMax));
        const max = toDate(limitValue(toTime(range.max), this.totalMin, this.totalMax));

        return {
            min: min,
            max: max
        };
    }
}

function timeUnits(delta) {
    let unit = HOURS;

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
    const min = options.min || seriesMin;
    const max = options.max || seriesMax;
    const baseUnit = options.baseUnit || (max && min ? timeUnits(absoluteDateDiff(max, min)) : HOURS);
    const baseUnitTime = TIME_PER_UNIT[baseUnit];
    const weekStartDay = options.weekStartDay || 0;
    const autoMin = floorDate(toTime(min) - 1, baseUnit, weekStartDay) || toDate(max);
    const autoMax = ceilDate(toTime(max) + 1, baseUnit, weekStartDay);
    const userMajorUnit = options.majorUnit ? options.majorUnit : undefined;
    const majorUnit = userMajorUnit || ceil(
                        autoMajorUnit(autoMin.getTime(), autoMax.getTime()),
                        baseUnitTime
                    ) / baseUnitTime;
    const actualUnits = duration(autoMin, autoMax, baseUnit);
    const totalUnits = ceil(actualUnits, majorUnit);
    const unitsToAdd = totalUnits - actualUnits;
    const head = Math.floor(unitsToAdd / 2);
    const tail = unitsToAdd - head;

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
