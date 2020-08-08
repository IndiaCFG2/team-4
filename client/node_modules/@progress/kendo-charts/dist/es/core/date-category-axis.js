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

var AUTO = "auto";
var BASE_UNITS = [
    MILLISECONDS, SECONDS, MINUTES, HOURS, DAYS, WEEKS, MONTHS, YEARS
];
var FIT = "fit";


function categoryRange(categories) {
    var range = categories._range;
    if (!range) {
        range = categories._range = sparseArrayLimits(categories);
        range.min = toDate(range.min);
        range.max = toDate(range.max);
    }

    return range;
}

var EmptyDateRange = function EmptyDateRange(options) {
    this.options = options;
};

EmptyDateRange.prototype.displayIndices = function displayIndices () {
    return {
        min: 0,
        max: 1
    };
};

EmptyDateRange.prototype.displayRange = function displayRange () {
    return {};
};

EmptyDateRange.prototype.total = function total () {
    return {};
};

EmptyDateRange.prototype.valueRange = function valueRange () {
    return {};
};

EmptyDateRange.prototype.valueIndex = function valueIndex () {
    return -1;
};

EmptyDateRange.prototype.values = function values () {
    return [];
};

EmptyDateRange.prototype.totalIndex = function totalIndex () {
    return -1;
};

EmptyDateRange.prototype.valuesCount = function valuesCount () {
    return 0;
};

EmptyDateRange.prototype.totalCount = function totalCount () {
    return 0;
};

EmptyDateRange.prototype.dateAt = function dateAt () {
    return null;
};

var DateRange = function DateRange(start, end, options) {
    this.options = options;
    options.baseUnitStep = options.baseUnitStep || 1;

    var roundToBaseUnit = options.roundToBaseUnit;
    var justified = options.justified;

    this.start = addDuration(start, 0, options.baseUnit, options.weekStartDay);
    var lowerEnd = this.roundToTotalStep(end);
    var expandEnd = !justified && dateEquals(end, lowerEnd) && !options.justifyEnd;

    this.end = this.roundToTotalStep(end, !justified, expandEnd ? 1 : 0);

    var min = options.min || start;
    this.valueStart = this.roundToTotalStep(min);
    this.displayStart = roundToBaseUnit ? this.valueStart : min;

    var max = options.max;
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
};

DateRange.prototype.displayRange = function displayRange () {
    return {
        min: this.displayStart,
        max: this.displayEnd
    };
};

DateRange.prototype.displayIndices = function displayIndices () {
    if (!this._indices) {
        var options = this.options;

        var baseUnit = options.baseUnit;
            var baseUnitStep = options.baseUnitStep;

        var minIdx = dateIndex(this.displayStart, this.valueStart, baseUnit, baseUnitStep);
        var maxIdx = dateIndex(this.displayEnd, this.valueStart, baseUnit, baseUnitStep);

        this._indices = { min: minIdx, max: maxIdx };
    }

    return this._indices;
};

DateRange.prototype.total = function total () {
    return {
        min: this.start,
        max: this.end
    };
};

DateRange.prototype.totalCount = function totalCount () {
    var last = this.totalIndex(this.end);

    return last + (this.options.justified ? 1 : 0);
};

DateRange.prototype.valueRange = function valueRange () {
    return {
        min: this.valueStart,
        max: this.valueEnd
    };
};

DateRange.prototype.valueIndex = function valueIndex (value) {
    var options = this.options;
    return Math.floor(dateIndex(value, this.valueStart, options.baseUnit, options.baseUnitStep));
};

DateRange.prototype.totalIndex = function totalIndex (value) {
    var options = this.options;
    return Math.floor(dateIndex(value, this.start, options.baseUnit, options.baseUnitStep));
};

DateRange.prototype.dateIndex = function dateIndex$1 (value) {
    var options = this.options;
    return dateIndex(value, this.valueStart, options.baseUnit, options.baseUnitStep);
};

DateRange.prototype.valuesCount = function valuesCount () {
    var maxIdx = this.valueIndex(this.valueEnd);

    return maxIdx + 1;
};

DateRange.prototype.values = function values () {
    var values = this._values;
    if (!values) {
        var options = this.options;
        var range = this.valueRange();
        this._values = values = [];

        for (var date = range.min; date <= range.max;) {
            values.push(date);
            date = addDuration(date, options.baseUnitStep, options.baseUnit, options.weekStartDay);
        }
    }

    return values;
};

DateRange.prototype.dateAt = function dateAt (index, total) {
    var options = this.options;

    return addDuration(total ? this.start : this.valueStart, options.baseUnitStep * index, options.baseUnit, options.weekStartDay);
};

DateRange.prototype.roundToTotalStep = function roundToTotalStep (value, upper, next) {
    var ref = this.options;
        var baseUnit = ref.baseUnit;
        var baseUnitStep = ref.baseUnitStep;
        var weekStartDay = ref.weekStartDay;
    var start = this.start;

    var step = dateIndex(value, start, baseUnit, baseUnitStep);
    var roundedStep = upper ? Math.ceil(step) : Math.floor(step);

    if (next) {
        roundedStep += next;
    }

    return addDuration(start, roundedStep * baseUnitStep, baseUnit, weekStartDay);
};

function autoBaseUnit(options, startUnit, startStep) {
    var categoryLimits = categoryRange(options.categories);
    var span = (options.max || categoryLimits.max) - (options.min || categoryLimits.min);
    var autoBaseUnitSteps = options.autoBaseUnitSteps;
    var maxDateGroups = options.maxDateGroups;
    var autoUnit = options.baseUnit === FIT;
    var autoUnitIx = startUnit ? BASE_UNITS.indexOf(startUnit) : 0;
    var baseUnit = autoUnit ? BASE_UNITS[autoUnitIx++] : options.baseUnit;
    var units = span / TIME_PER_UNIT[baseUnit];
    var totalUnits = units;
    var unitSteps, step, nextStep;

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
    var categories = options.categories;
    var count = defined(categories) ? categories.length : 0;
    var minDiff = MAX_VALUE;
    var lastCategory, unit;

    for (var categoryIx = 0; categoryIx < count; categoryIx++) {
        var category = categories[categoryIx];

        if (category && lastCategory) {
            var diff = absoluteDateDiff(category, lastCategory);
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
    var baseUnit = (options.baseUnit || "").toLowerCase();
    var useDefault = baseUnit !== FIT && !inArray(baseUnit, BASE_UNITS);

    if (useDefault) {
        defaultBaseUnit(options);
    }

    if (baseUnit === FIT || options.baseUnitStep === AUTO) {
        autoBaseUnit(options);
    }

    return options;
}

var DateCategoryAxis = (function (CategoryAxis) {
    function DateCategoryAxis () {
        CategoryAxis.apply(this, arguments);
    }

    if ( CategoryAxis ) DateCategoryAxis.__proto__ = CategoryAxis;
    DateCategoryAxis.prototype = Object.create( CategoryAxis && CategoryAxis.prototype );
    DateCategoryAxis.prototype.constructor = DateCategoryAxis;

    DateCategoryAxis.prototype.clone = function clone () {
        var copy = new DateCategoryAxis(Object.assign({}, this.options), this.chartService);
        copy.createLabels();

        return copy;
    };

    DateCategoryAxis.prototype.categoriesHash = function categoriesHash () {
        var start = this.dataRange.total().min;
        return this.options.baseUnit + this.options.baseUnitStep + start;
    };

    DateCategoryAxis.prototype.initUserOptions = function initUserOptions (options) {
        return options;
    };

    DateCategoryAxis.prototype.initFields = function initFields () {
        CategoryAxis.prototype.initFields.call(this);

        var chartService = this.chartService;
        var intlService = chartService.intl;
        var options = this.options;

        var categories = options.categories || [];
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
            var range = categoryRange(categories);
            var maxDivisions = options.maxDivisions;

            this.dataRange = new DateRange(range.min, range.max, initUnit(options));

            if (maxDivisions) {
                var dataRange = this.dataRange.displayRange();

                var divisionOptions = Object.assign({}, options, {
                    justified: true,
                    roundToBaseUnit: false,
                    baseUnit: 'fit',
                    min: dataRange.min,
                    max: dataRange.max,
                    maxDateGroups: maxDivisions
                });

                var dataRangeOptions = this.dataRange.options;

                autoBaseUnit(divisionOptions, dataRangeOptions.baseUnit, dataRangeOptions.baseUnitStep);

                this.divisionRange = new DateRange(range.min, range.max, divisionOptions);
            } else {
                this.divisionRange = this.dataRange;
            }

        } else {
            options.baseUnit = options.baseUnit || DAYS;
            this.dataRange = this.divisionRange = new EmptyDateRange(options);
        }
    };

    DateCategoryAxis.prototype.tickIndices = function tickIndices (stepSize) {
        var ref = this;
        var dataRange = ref.dataRange;
        var divisionRange = ref.divisionRange;
        var valuesCount = divisionRange.valuesCount();

        if (!this.options.maxDivisions || !valuesCount) {
            return CategoryAxis.prototype.tickIndices.call(this, stepSize);
        }

        var indices = [];
        var values = divisionRange.values();
        var offset = 0;

        if (!this.options.justified) {
            values = values.concat(divisionRange.dateAt(valuesCount));
            offset = 0.5;//align ticks to the center of not justified categories
        }

        for (var idx = 0; idx < values.length; idx++) {
            indices.push(dataRange.dateIndex(values[idx]) + offset);
            if (stepSize !== 1 && idx >= 1) {
                var last = indices.length - 1;
                indices.splice(idx, 0, indices[last - 1] + (indices[last] - indices[last - 1]) * stepSize);
            }
        }

        return indices;
    };

    DateCategoryAxis.prototype.shouldRenderNote = function shouldRenderNote (value) {
        var range = this.range();
        var categories = this.options.categories || [];

        return dateComparer(value, range.min) >= 0 && dateComparer(value, range.max) <= 0 && categories.length;
    };

    DateCategoryAxis.prototype.parseNoteValue = function parseNoteValue (value) {
        return parseDate(this.chartService.intl, value);
    };

    DateCategoryAxis.prototype.noteSlot = function noteSlot (value) {
        return this.getSlot(value);
    };

    DateCategoryAxis.prototype.translateRange = function translateRange (delta) {
        var options = this.options;
        var baseUnit = options.baseUnit;
        var weekStartDay = options.weekStartDay;
        var vertical = options.vertical;
        var lineBox = this.lineBox();
        var size = vertical ? lineBox.height() : lineBox.width();
        var range = this.range();
        var scale = size / (range.max - range.min);
        var offset = round(delta / scale, DEFAULT_PRECISION);

        if (range.min && range.max) {
            var from = addTicks(options.min || range.min, offset);
            var to = addTicks(options.max || range.max, offset);

            range = {
                min: addDuration(from, 0, baseUnit, weekStartDay),
                max: addDuration(to, 0, baseUnit, weekStartDay)
            };
        }

        return range;
    };

    DateCategoryAxis.prototype.scaleRange = function scaleRange (delta) {
        var rounds = Math.abs(delta);
        var result = this.range();
        var from = result.min;
        var to = result.max;

        if (from && to) {
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

            result = { min: from, max: to };
        }

        return result;
    };

    DateCategoryAxis.prototype.labelsRange = function labelsRange () {
        return {
            min: this.options.labels.skip,
            max: this.divisionRange.valuesCount()
        };
    };

    DateCategoryAxis.prototype.pan = function pan (delta) {
        if (this.isEmpty()) {
            return null;
        }

        var options = this.options;
        var lineBox = this.lineBox();
        var size = options.vertical ? lineBox.height() : lineBox.width();
        var ref = this.dataRange.displayRange();
        var min = ref.min;
        var max = ref.max;
        var totalLimits = this.dataRange.total();
        var scale = size / (max - min);
        var offset = round(delta / scale, DEFAULT_PRECISION) * (options.reverse ? -1 : 1);
        var from = addTicks(min, offset);
        var to = addTicks(max, offset);

        var panRange = this.limitRange(toTime(from), toTime(to), toTime(totalLimits.min), toTime(totalLimits.max), offset);

        if (panRange) {
            panRange.min = toDate(panRange.min);
            panRange.max = toDate(panRange.max);
            panRange.baseUnit = options.baseUnit;
            panRange.baseUnitStep = options.baseUnitStep || 1;
            panRange.userSetBaseUnit = options.userSetBaseUnit;
            panRange.userSetBaseUnitStep = options.userSetBaseUnitStep;

            return panRange;
        }
    };

    DateCategoryAxis.prototype.pointsRange = function pointsRange (start, end) {
        if (this.isEmpty()) {
            return null;
        }

        var pointsRange = CategoryAxis.prototype.pointsRange.call(this, start, end);
        var datesRange = this.dataRange.displayRange();
        var indicesRange = this.dataRange.displayIndices();
        var scale = dateDiff(datesRange.max, datesRange.min) / (indicesRange.max - indicesRange.min);
        var options = this.options;

        var min = addTicks(datesRange.min, pointsRange.min * scale);
        var max = addTicks(datesRange.min, pointsRange.max * scale);

        return {
            min: min,
            max: max,
            baseUnit: options.userSetBaseUnit || options.baseUnit,
            baseUnitStep: options.userSetBaseUnitStep || options.baseUnitStep
        };
    };

    DateCategoryAxis.prototype.zoomRange = function zoomRange (delta) {
        if (this.isEmpty()) {
            return null;
        }

        var options = this.options;
        var fit = options.userSetBaseUnit === FIT;
        var totalLimits = this.dataRange.total();
        var ref = this.dataRange.displayRange();
        var rangeMin = ref.min;
        var rangeMax = ref.max;
        var ref$1 = this.dataRange.options;
        var weekStartDay = ref$1.weekStartDay;
        var baseUnit = ref$1.baseUnit;
        var baseUnitStep = ref$1.baseUnitStep;
        var min = addDuration(rangeMin, delta * baseUnitStep, baseUnit, weekStartDay);
        var max = addDuration(rangeMax, -delta * baseUnitStep, baseUnit, weekStartDay);

        if (fit) {
            var autoBaseUnitSteps = options.autoBaseUnitSteps;
            var maxDateGroups = options.maxDateGroups;

            var maxDiff = last(autoBaseUnitSteps[baseUnit]) * maxDateGroups * TIME_PER_UNIT[baseUnit];
            var rangeDiff = dateDiff(rangeMax, rangeMin);
            var diff = dateDiff(max, min);
            var baseUnitIndex = BASE_UNITS.indexOf(baseUnit);
            var autoBaseUnitStep, ticks;

            if (diff < TIME_PER_UNIT[baseUnit] && baseUnit !== MILLISECONDS) {
                baseUnit = BASE_UNITS[baseUnitIndex - 1];
                autoBaseUnitStep = last(autoBaseUnitSteps[baseUnit]);
                ticks = (rangeDiff - (maxDateGroups - 1) * autoBaseUnitStep * TIME_PER_UNIT[baseUnit]) / 2;
                min = addTicks(rangeMin, ticks);
                max = addTicks(rangeMax, -ticks);

            } else if (diff > maxDiff && baseUnit !== YEARS) {
                var stepIndex = 0;

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
    };

    DateCategoryAxis.prototype.range = function range () {
        return this.dataRange.displayRange();
    };

    DateCategoryAxis.prototype.createAxisLabel = function createAxisLabel (index, labelOptions) {
        var options = this.options;
        var dataItem = options.dataItems && !options.maxDivisions ? options.dataItems[index] : null;
        var date = this.divisionRange.dateAt(index);
        var unitFormat = labelOptions.dateFormats[this.divisionRange.options.baseUnit];

        labelOptions.format = labelOptions.format || unitFormat;
        var text = this.axisLabelText(date, dataItem, labelOptions);
        if (text) {
            return new AxisLabel(date, text, index, dataItem, labelOptions);
        }
    };

    DateCategoryAxis.prototype.categoryIndex = function categoryIndex (value) {
        return this.dataRange.valueIndex(value);
    };

    DateCategoryAxis.prototype.slot = function slot (from, to, limit) {
        var dateRange = this.dataRange;
        var start = from;
        var end = to;

        if (start instanceof Date) {
            start = dateRange.dateIndex(start);
        }

        if (end instanceof Date) {
            end = dateRange.dateIndex(end);
        }

        var slot = this.getSlot(start, end, limit);
        if (slot) {
            return slot.toRect();
        }
    };

    DateCategoryAxis.prototype.getSlot = function getSlot (a, b, limit) {
        var start = a;
        var end = b;

        if (typeof start === OBJECT) {
            start = this.categoryIndex(start);
        }

        if (typeof end === OBJECT) {
            end = this.categoryIndex(end);
        }

        return CategoryAxis.prototype.getSlot.call(this, start, end, limit);
    };

    DateCategoryAxis.prototype.valueRange = function valueRange () {
        var options = this.options;
        var range = categoryRange(options.srcCategories);

        return {
            min: toDate(range.min),
            max: toDate(range.max)
        };
    };

    DateCategoryAxis.prototype.categoryAt = function categoryAt (index, total) {
        return this.dataRange.dateAt(index, total);
    };

    DateCategoryAxis.prototype.categoriesCount = function categoriesCount () {
        return this.dataRange.valuesCount();
    };

    DateCategoryAxis.prototype.rangeIndices = function rangeIndices () {
        return this.dataRange.displayIndices();
    };

    DateCategoryAxis.prototype.labelsBetweenTicks = function labelsBetweenTicks () {
        return !this.divisionRange.options.justified;
    };

    DateCategoryAxis.prototype.prepareUserOptions = function prepareUserOptions () {
        if (this.isEmpty()) {
            return;
        }

        this.options.categories = this.dataRange.values();
    };

    DateCategoryAxis.prototype.getCategory = function getCategory (point) {
        var index = this.pointCategoryIndex(point);

        if (index === null) {
            return null;
        }

        return this.dataRange.dateAt(index);
    };

    DateCategoryAxis.prototype.totalIndex = function totalIndex (value) {
        return this.dataRange.totalIndex(value);
    };

    DateCategoryAxis.prototype.currentRangeIndices = function currentRangeIndices () {
        var range = this.dataRange.valueRange();
        return {
            min: this.dataRange.totalIndex(range.min),
            max: this.dataRange.totalIndex(range.max)
        };
    };

    DateCategoryAxis.prototype.totalRange = function totalRange () {
        return this.dataRange.total();
    };

    DateCategoryAxis.prototype.totalCount = function totalCount () {
        return this.dataRange.totalCount();
    };

    DateCategoryAxis.prototype.isEmpty = function isEmpty () {
        return !this.options.srcCategories.length;
    };

    DateCategoryAxis.prototype.roundedRange = function roundedRange () {
        if (this.options.roundToBaseUnit !== false || this.isEmpty()) {
            return this.range();
        }

        var options = this.options;
        var datesRange = categoryRange(options.srcCategories);

        var dateRange = new DateRange(datesRange.min, datesRange.max, Object.assign({}, options, {
            justified: false,
            roundToBaseUnit: true,
            justifyEnd: options.justified
        }));

        return dateRange.displayRange();
    };

    return DateCategoryAxis;
}(CategoryAxis));

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
