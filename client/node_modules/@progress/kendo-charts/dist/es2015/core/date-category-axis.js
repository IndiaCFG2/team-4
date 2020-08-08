import CategoryAxis from './category-axis';
import AxisLabel from './axis-label';

import { DEFAULT_PRECISION, MAX_VALUE, OBJECT, DATE, X, Y } from '../common/constants';
import { deepExtend, defined, inArray, last, limitValue, round, setDefaultOptions, sparseArrayLimits } from '../common';

import { MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS, WEEKS, MONTHS, YEARS,
    TIME_PER_MINUTE, TIME_PER_HOUR, TIME_PER_DAY, TIME_PER_WEEK,
    TIME_PER_MONTH, TIME_PER_YEAR, TIME_PER_UNIT } from '../date-utils/constants';
import { dateComparer, toDate, addTicks, addDuration, dateDiff, absoluteDateDiff,
    dateIndex, dateEquals, toTime, parseDate, parseDates } from '../date-utils';

import { DateLabelFormats } from './constants';

const AUTO = "auto";
const BASE_UNITS = [
    MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS, WEEKS, MONTHS, YEARS
];
const FIT = "fit";


function categoryRange(categories) {
    let range = categories._range;
    if (!range) {
        range = categories._range = sparseArrayLimits(categories);
        range.min = toDate(range.min);
        range.max = toDate(range.max);
    }

    return range;
}

class EmptyDateRange {
    constructor(options) {
        this.options = options;
    }

    displayIndices() {
        return {
            min: 0,
            max: 1
        };
    }

    displayRange() {
        return {};
    }

    total() {
        return {};
    }

    valueRange() {
        return {};
    }

    valueIndex() {
        return -1;
    }

    values() {
        return [];
    }

    totalIndex() {
        return -1;
    }

    valuesCount() {
        return 0;
    }

    totalCount() {
        return 0;
    }

    dateAt() {
        return null;
    }
}

class DateRange {
    constructor(start, end, options) {
        this.options = options;
        options.baseUnitStep = options.baseUnitStep || 1;

        const { roundToBaseUnit, justified } = options;

        this.start = addDuration(start, 0, options.baseUnit, options.weekStartDay);
        const lowerEnd = this.roundToTotalStep(end);
        const expandEnd = !justified && dateEquals(end, lowerEnd) && !options.justifyEnd;

        this.end = this.roundToTotalStep(end, !justified, expandEnd ? 1 : 0);

        const min = options.min || start;
        this.valueStart = this.roundToTotalStep(min);
        this.displayStart = roundToBaseUnit ? this.valueStart : min;

        const max = options.max;
        if (!max) {
            this.valueEnd = lowerEnd;
            this.displayEnd = roundToBaseUnit || expandEnd ? this.end : end;
        } else {
            this.valueEnd = this.roundToTotalStep(max, false, !justified && dateEquals(max, this.roundToTotalStep(max)) ? -1 : 0);
            this.displayEnd = roundToBaseUnit ? this.roundToTotalStep(max, !justified) : options.max;
        }

        if (this.valueEnd < this.valueStart) {
            this.valueEnd = this.valueStart;
        }
        if (this.displayEnd <= this.displayStart) {
            this.displayEnd = this.roundToTotalStep(this.displayStart, false, 1);
        }
    }

    displayRange() {
        return {
            min: this.displayStart,
            max: this.displayEnd
        };
    }

    displayIndices() {
        if (!this._indices) {
            const options = this.options;

            const { baseUnit, baseUnitStep } = options;

            const minIdx = dateIndex(this.displayStart, this.valueStart, baseUnit, baseUnitStep);
            const maxIdx = dateIndex(this.displayEnd, this.valueStart, baseUnit, baseUnitStep);

            this._indices = { min: minIdx, max: maxIdx };
        }

        return this._indices;
    }

    total() {
        return {
            min: this.start,
            max: this.end
        };
    }

    totalCount() {
        const last = this.totalIndex(this.end);

        return last + (this.options.justified ? 1 : 0);
    }

    valueRange() {
        return {
            min: this.valueStart,
            max: this.valueEnd
        };
    }

    valueIndex(value) {
        const options = this.options;
        return Math.floor(dateIndex(value, this.valueStart, options.baseUnit, options.baseUnitStep));
    }

    totalIndex(value) {
        const options = this.options;
        return Math.floor(dateIndex(value, this.start, options.baseUnit, options.baseUnitStep));
    }

    dateIndex(value) {
        const options = this.options;
        return dateIndex(value, this.valueStart, options.baseUnit, options.baseUnitStep);
    }

    valuesCount() {
        const maxIdx = this.valueIndex(this.valueEnd);

        return maxIdx + 1;
    }

    values() {
        let values = this._values;
        if (!values) {
            const options = this.options;
            const range = this.valueRange();
            this._values = values = [];

            for (let date = range.min; date <= range.max;) {
                values.push(date);
                date = addDuration(date, options.baseUnitStep, options.baseUnit, options.weekStartDay);
            }
        }

        return values;
    }

    dateAt(index, total) {
        const options = this.options;

        return addDuration(total ? this.start : this.valueStart, options.baseUnitStep * index, options.baseUnit, options.weekStartDay);
    }

    roundToTotalStep(value, upper, next) {
        const { baseUnit, baseUnitStep, weekStartDay } = this.options;
        const start = this.start;

        const step = dateIndex(value, start, baseUnit, baseUnitStep);
        let roundedStep = upper ? Math.ceil(step) : Math.floor(step);

        if (next) {
            roundedStep += next;
        }

        return addDuration(start, roundedStep * baseUnitStep, baseUnit, weekStartDay);
    }

}

function autoBaseUnit(options, startUnit, startStep) {
    const categoryLimits = categoryRange(options.categories);
    const span = (options.max || categoryLimits.max) - (options.min || categoryLimits.min);
    const { autoBaseUnitSteps, maxDateGroups } = options;
    const autoUnit = options.baseUnit === FIT;
    let autoUnitIx = startUnit ? BASE_UNITS.indexOf(startUnit) : 0;
    let baseUnit = autoUnit ? BASE_UNITS[autoUnitIx++] : options.baseUnit;
    let units = span / TIME_PER_UNIT[baseUnit];
    let totalUnits = units;
    let unitSteps, step, nextStep;

    while (!step || units >= maxDateGroups) {
        unitSteps = unitSteps || autoBaseUnitSteps[baseUnit].slice(0);

        do {
            nextStep = unitSteps.shift();
        } while (nextStep && startUnit === baseUnit && nextStep < startStep);

        if (nextStep) {
            step = nextStep;
            units = totalUnits / step;
        } else if (baseUnit === last(BASE_UNITS)) {
            step = Math.ceil(totalUnits / maxDateGroups);
            break;
        } else if (autoUnit) {
            baseUnit = BASE_UNITS[autoUnitIx++] || last(BASE_UNITS);
            totalUnits = span / TIME_PER_UNIT[baseUnit];
            unitSteps = null;
        } else {
            if (units > maxDateGroups) {
                step = Math.ceil(totalUnits / maxDateGroups);
            }
            break;
        }
    }

    options.baseUnitStep = step;
    options.baseUnit = baseUnit;
}

function defaultBaseUnit(options) {
    const categories = options.categories;
    const count = defined(categories) ? categories.length : 0;
    let minDiff = MAX_VALUE;
    let lastCategory, unit;

    for (let categoryIx = 0; categoryIx < count; categoryIx++) {
        const category = categories[categoryIx];

        if (category && lastCategory) {
            const diff = absoluteDateDiff(category, lastCategory);
            if (diff > 0) {
                minDiff = Math.min(minDiff, diff);

                if (minDiff >= TIME_PER_YEAR) {
                    unit = YEARS;
                } else if (minDiff >= TIME_PER_MONTH - TIME_PER_DAY * 3) {
                    unit = MONTHS;
                } else if (minDiff >= TIME_PER_WEEK) {
                    unit = WEEKS;
                } else if (minDiff >= TIME_PER_DAY) {
                    unit = DAYS;
                } else if (minDiff >= TIME_PER_HOUR) {
                    unit = HOURS;
                } else if (minDiff >= TIME_PER_MINUTE) {
                    unit = MINUTES;
                } else {
                    unit = SECONDS;
                }
            }
        }

        lastCategory = category;
    }

    options.baseUnit = unit || DAYS;
}

function initUnit(options) {
    const baseUnit = (options.baseUnit || "").toLowerCase();
    const useDefault = baseUnit !== FIT && !inArray(baseUnit, BASE_UNITS);

    if (useDefault) {
        defaultBaseUnit(options);
    }

    if (baseUnit === FIT || options.baseUnitStep === AUTO) {
        autoBaseUnit(options);
    }

    return options;
}

class DateCategoryAxis extends CategoryAxis {

    clone() {
        const copy = new DateCategoryAxis(Object.assign({}, this.options), this.chartService);
        copy.createLabels();

        return copy;
    }

    categoriesHash() {
        const start = this.dataRange.total().min;
        return this.options.baseUnit + this.options.baseUnitStep + start;
    }

    initUserOptions(options) {
        return options;
    }

    initFields() {
        super.initFields();

        const chartService = this.chartService;
        const intlService = chartService.intl;
        let options = this.options;

        let categories = options.categories || [];
        if (!categories._parsed) {
            categories = parseDates(intlService, categories);
            categories._parsed = true;
        }

        options = deepExtend({
            roundToBaseUnit: true
        }, options, {
            categories: categories,
            min: parseDate(intlService, options.min),
            max: parseDate(intlService, options.max)
        });

        if (chartService.panning && chartService.isPannable(options.vertical ? Y : X)) {
            options.roundToBaseUnit = false;
        }

        options.userSetBaseUnit = options.userSetBaseUnit || options.baseUnit;
        options.userSetBaseUnitStep = options.userSetBaseUnitStep || options.baseUnitStep;

        this.options = options;
        options.srcCategories = categories;

        if (categories.length > 0) {
            const range = categoryRange(categories);
            const maxDivisions = options.maxDivisions;

            this.dataRange = new DateRange(range.min, range.max, initUnit(options));

            if (maxDivisions) {
                const dataRange = this.dataRange.displayRange();

                const divisionOptions = Object.assign({}, options, {
                    justified: true,
                    roundToBaseUnit: false,
                    baseUnit: 'fit',
                    min: dataRange.min,
                    max: dataRange.max,
                    maxDateGroups: maxDivisions
                });

                const dataRangeOptions = this.dataRange.options;

                autoBaseUnit(divisionOptions, dataRangeOptions.baseUnit, dataRangeOptions.baseUnitStep);

                this.divisionRange = new DateRange(range.min, range.max, divisionOptions);
            } else {
                this.divisionRange = this.dataRange;
            }

        } else {
            options.baseUnit = options.baseUnit || DAYS;
            this.dataRange = this.divisionRange = new EmptyDateRange(options);
        }
    }

    tickIndices(stepSize) {
        const { dataRange, divisionRange } = this;
        const valuesCount = divisionRange.valuesCount();

        if (!this.options.maxDivisions || !valuesCount) {
            return super.tickIndices(stepSize);
        }

        const indices = [];
        let values = divisionRange.values();
        let offset = 0;

        if (!this.options.justified) {
            values = values.concat(divisionRange.dateAt(valuesCount));
            offset = 0.5;//align ticks to the center of not justified categories
        }

        for (let idx = 0; idx < values.length; idx++) {
            indices.push(dataRange.dateIndex(values[idx]) + offset);
            if (stepSize !== 1 && idx >= 1) {
                const last = indices.length - 1;
                indices.splice(idx, 0, indices[last - 1] + (indices[last] - indices[last - 1]) * stepSize);
            }
        }

        return indices;
    }

    shouldRenderNote(value) {
        const range = this.range();
        const categories = this.options.categories || [];

        return dateComparer(value, range.min) >= 0 && dateComparer(value, range.max) <= 0 && categories.length;
    }

    parseNoteValue(value) {
        return parseDate(this.chartService.intl, value);
    }

    noteSlot(value) {
        return this.getSlot(value);
    }

    translateRange(delta) {
        const options = this.options;
        const { baseUnit, weekStartDay, vertical } = options;
        const lineBox = this.lineBox();
        const size = vertical ? lineBox.height() : lineBox.width();
        let range = this.range();
        const scale = size / (range.max - range.min);
        const offset = round(delta / scale, DEFAULT_PRECISION);

        if (range.min && range.max) {
            const from = addTicks(options.min || range.min, offset);
            const to = addTicks(options.max || range.max, offset);

            range = {
                min: addDuration(from, 0, baseUnit, weekStartDay),
                max: addDuration(to, 0, baseUnit, weekStartDay)
            };
        }

        return range;
    }

    scaleRange(delta) {
        let rounds = Math.abs(delta);
        let result = this.range();
        let { min: from, max: to } = result;

        if (from && to) {
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

            result = { min: from, max: to };
        }

        return result;
    }

    labelsRange() {
        return {
            min: this.options.labels.skip,
            max: this.divisionRange.valuesCount()
        };
    }

    pan(delta) {
        if (this.isEmpty()) {
            return null;
        }

        const options = this.options;
        const lineBox = this.lineBox();
        const size = options.vertical ? lineBox.height() : lineBox.width();
        const { min, max } = this.dataRange.displayRange();
        const totalLimits = this.dataRange.total();
        const scale = size / (max - min);
        const offset = round(delta / scale, DEFAULT_PRECISION) * (options.reverse ? -1 : 1);
        const from = addTicks(min, offset);
        const to = addTicks(max, offset);

        const panRange = this.limitRange(toTime(from), toTime(to), toTime(totalLimits.min), toTime(totalLimits.max), offset);

        if (panRange) {
            panRange.min = toDate(panRange.min);
            panRange.max = toDate(panRange.max);
            panRange.baseUnit = options.baseUnit;
            panRange.baseUnitStep = options.baseUnitStep || 1;
            panRange.userSetBaseUnit = options.userSetBaseUnit;
            panRange.userSetBaseUnitStep = options.userSetBaseUnitStep;

            return panRange;
        }
    }

    pointsRange(start, end) {
        if (this.isEmpty()) {
            return null;
        }

        const pointsRange = super.pointsRange(start, end);
        const datesRange = this.dataRange.displayRange();
        const indicesRange = this.dataRange.displayIndices();
        const scale = dateDiff(datesRange.max, datesRange.min) / (indicesRange.max - indicesRange.min);
        const options = this.options;

        const min = addTicks(datesRange.min, pointsRange.min * scale);
        const max = addTicks(datesRange.min, pointsRange.max * scale);

        return {
            min: min,
            max: max,
            baseUnit: options.userSetBaseUnit || options.baseUnit,
            baseUnitStep: options.userSetBaseUnitStep || options.baseUnitStep
        };
    }

    zoomRange(delta) {
        if (this.isEmpty()) {
            return null;
        }

        const options = this.options;
        const fit = options.userSetBaseUnit === FIT;
        const totalLimits = this.dataRange.total();
        const { min: rangeMin, max: rangeMax } = this.dataRange.displayRange();
        let { weekStartDay, baseUnit, baseUnitStep } = this.dataRange.options;
        let min = addDuration(rangeMin, delta * baseUnitStep, baseUnit, weekStartDay);
        let max = addDuration(rangeMax, -delta * baseUnitStep, baseUnit, weekStartDay);

        if (fit) {
            const { autoBaseUnitSteps, maxDateGroups } = options;

            const maxDiff = last(autoBaseUnitSteps[baseUnit]) * maxDateGroups * TIME_PER_UNIT[baseUnit];
            const rangeDiff = dateDiff(rangeMax, rangeMin);
            const diff = dateDiff(max, min);
            let baseUnitIndex = BASE_UNITS.indexOf(baseUnit);
            let autoBaseUnitStep, ticks;

            if (diff < TIME_PER_UNIT[baseUnit] && baseUnit !== MILLISECONDS) {
                baseUnit = BASE_UNITS[baseUnitIndex - 1];
                autoBaseUnitStep = last(autoBaseUnitSteps[baseUnit]);
                ticks = (rangeDiff - (maxDateGroups - 1) * autoBaseUnitStep * TIME_PER_UNIT[baseUnit]) / 2;
                min = addTicks(rangeMin, ticks);
                max = addTicks(rangeMax, -ticks);

            } else if (diff > maxDiff && baseUnit !== YEARS) {
                let stepIndex = 0;

                do {
                    baseUnitIndex++;
                    baseUnit = BASE_UNITS[baseUnitIndex];
                    stepIndex = 0;
                    ticks = 2 * TIME_PER_UNIT[baseUnit];
                    do {
                        autoBaseUnitStep = autoBaseUnitSteps[baseUnit][stepIndex];
                        stepIndex++;
                    } while (stepIndex < autoBaseUnitSteps[baseUnit].length && ticks * autoBaseUnitStep < rangeDiff);
                } while (baseUnit !== YEARS && ticks * autoBaseUnitStep < rangeDiff);

                ticks = (ticks * autoBaseUnitStep - rangeDiff) / 2;
                if (ticks > 0) {
                    min = addTicks(rangeMin, -ticks);
                    max = addTicks(rangeMax, ticks);
                    min = addTicks(min, limitValue(max, totalLimits.min, totalLimits.max) - max);
                    max = addTicks(max, limitValue(min, totalLimits.min, totalLimits.max) - min);
                }
            }
        }

        if (min < totalLimits.min) {
            min = totalLimits.min;
        }
        if (max > totalLimits.max) {
            max = totalLimits.max;
        }

        if (min && max && dateDiff(max, min) > 0) {
            return {
                min: min,
                max: max,
                baseUnit: options.userSetBaseUnit || options.baseUnit,
                baseUnitStep: options.userSetBaseUnitStep || options.baseUnitStep
            };
        }
    }

    range() {
        return this.dataRange.displayRange();
    }

    createAxisLabel(index, labelOptions) {
        const options = this.options;
        const dataItem = options.dataItems && !options.maxDivisions ? options.dataItems[index] : null;
        const date = this.divisionRange.dateAt(index);
        const unitFormat = labelOptions.dateFormats[this.divisionRange.options.baseUnit];

        labelOptions.format = labelOptions.format || unitFormat;
        const text = this.axisLabelText(date, dataItem, labelOptions);
        if (text) {
            return new AxisLabel(date, text, index, dataItem, labelOptions);
        }
    }

    categoryIndex(value) {
        return this.dataRange.valueIndex(value);
    }

    slot(from, to, limit) {
        const dateRange = this.dataRange;
        let start = from;
        let end = to;

        if (start instanceof Date) {
            start = dateRange.dateIndex(start);
        }

        if (end instanceof Date) {
            end = dateRange.dateIndex(end);
        }

        const slot = this.getSlot(start, end, limit);
        if (slot) {
            return slot.toRect();
        }
    }

    getSlot(a, b, limit) {
        let start = a;
        let end = b;

        if (typeof start === OBJECT) {
            start = this.categoryIndex(start);
        }

        if (typeof end === OBJECT) {
            end = this.categoryIndex(end);
        }

        return super.getSlot(start, end, limit);
    }

    valueRange() {
        const options = this.options;
        const range = categoryRange(options.srcCategories);

        return {
            min: toDate(range.min),
            max: toDate(range.max)
        };
    }

    categoryAt(index, total) {
        return this.dataRange.dateAt(index, total);
    }

    categoriesCount() {
        return this.dataRange.valuesCount();
    }

    rangeIndices() {
        return this.dataRange.displayIndices();
    }

    labelsBetweenTicks() {
        return !this.divisionRange.options.justified;
    }

    prepareUserOptions() {
        if (this.isEmpty()) {
            return;
        }

        this.options.categories = this.dataRange.values();
    }

    getCategory(point) {
        const index = this.pointCategoryIndex(point);

        if (index === null) {
            return null;
        }

        return this.dataRange.dateAt(index);
    }

    totalIndex(value) {
        return this.dataRange.totalIndex(value);
    }

    currentRangeIndices() {
        const range = this.dataRange.valueRange();
        return {
            min: this.dataRange.totalIndex(range.min),
            max: this.dataRange.totalIndex(range.max)
        };
    }

    totalRange() {
        return this.dataRange.total();
    }

    totalCount() {
        return this.dataRange.totalCount();
    }

    isEmpty() {
        return !this.options.srcCategories.length;
    }

    roundedRange() {
        if (this.options.roundToBaseUnit !== false || this.isEmpty()) {
            return this.range();
        }

        const options = this.options;
        const datesRange = categoryRange(options.srcCategories);

        const dateRange = new DateRange(datesRange.min, datesRange.max, Object.assign({}, options, {
            justified: false,
            roundToBaseUnit: true,
            justifyEnd: options.justified
        }));

        return dateRange.displayRange();
    }
}

setDefaultOptions(DateCategoryAxis, {
    type: DATE,
    labels: {
        dateFormats: DateLabelFormats
    },
    autoBaseUnitSteps: {
        milliseconds: [ 1, 10, 100 ],
        seconds: [ 1, 2, 5, 15, 30 ],
        minutes: [ 1, 2, 5, 15, 30 ],
        hours: [ 1, 2, 3 ],
        days: [ 1, 2, 3 ],
        weeks: [ 1, 2 ],
        months: [ 1, 2, 3, 6 ],
        years: [ 1, 2, 3, 5, 10, 25, 50 ]
    },
    maxDateGroups: 10
});

export default DateCategoryAxis;
