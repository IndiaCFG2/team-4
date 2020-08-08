import Axis from './axis';
import AxisLabel from './axis-label';

import { BLACK, COORD_PRECISION, DEFAULT_PRECISION, X, Y } from '../common/constants';
import { defined, isNumber, last, limitValue, round, setDefaultOptions, valueOrDefault, HashMap } from '../common';
import { dateEquals } from '../date-utils';

const MIN_CATEGORY_POINTS_RANGE = 0.01;

function indexOf(value, arr) {
    if (value instanceof Date) {
        const length = arr.length;
        for (let idx = 0; idx < length; idx++) {
            if (dateEquals(arr[idx], value)) {
                return idx;
            }
        }

        return -1;
    }

    return arr.indexOf(value);
}

class CategoryAxis extends Axis {
    initFields() {
        this._ticks = {};
    }

    categoriesHash() {
        return "";
    }

    clone() {
        const copy = new CategoryAxis(Object.assign({}, this.options, {
            categories: this.options.srcCategories
        }), this.chartService);
        copy.createLabels();

        return copy;
    }

    initUserOptions(options) {
        const categories = options.categories || [];
        const definedMin = defined(options.min);
        const definedMax = defined(options.max);
        options.srcCategories = options.categories = categories;

        if ((definedMin || definedMax) && categories.length) {
            const min = definedMin ? Math.floor(options.min) : 0;
            let max;

            if (definedMax) {
                max = options.justified ? Math.floor(options.max) + 1 : Math.ceil(options.max);
            } else {
                max = categories.length;
            }

            options.categories = options.categories.slice(min, max);
        }

        return options;
    }

    rangeIndices() {
        const options = this.options;
        const length = options.categories.length || 1;
        const min = isNumber(options.min) ? options.min % 1 : 0;
        let max;

        if (isNumber(options.max) && options.max % 1 !== 0 && options.max < this.totalRange().max) {
            max = length - (1 - options.max % 1);
        } else {
            max = length - (options.justified ? 1 : 0);
        }

        return {
            min: min,
            max: max
        };
    }

    totalRangeIndices(limit) {
        const options = this.options;
        let min = isNumber(options.min) ? options.min : 0;
        let max;

        if (isNumber(options.max)) {
            max = options.max;
        } else if (isNumber(options.min)) {
            max = min + options.categories.length;
        } else {
            max = this.totalRange().max || 1;
        }

        if (limit) {
            const totalRange = this.totalRange();
            min = limitValue(min, 0, totalRange.max);
            max = limitValue(max, 0, totalRange.max);
        }

        return {
            min: min,
            max: max
        };
    }

    range() {
        const options = this.options;
        const min = isNumber(options.min) ? options.min : 0;
        const max = isNumber(options.max) ? options.max : this.totalRange().max;

        return {
            min: min,
            max: max
        };
    }

    roundedRange() {
        return this.range();
    }

    totalRange() {
        const options = this.options;
        return { min: 0, max: Math.max(this._seriesMax || 0, options.srcCategories.length) - (options.justified ? 1 : 0) };
    }

    scaleOptions() {
        const { min, max } = this.rangeIndices();
        const lineBox = this.lineBox();
        const size = this.options.vertical ? lineBox.height() : lineBox.width();
        const scale = size / ((max - min) || 1);

        return {
            scale: scale * (this.options.reverse ? -1 : 1),
            box: lineBox,
            min: min,
            max: max
        };
    }

    arrangeLabels() {
        super.arrangeLabels();
        this.hideOutOfRangeLabels();
    }

    hideOutOfRangeLabels() {
        const { box, labels } = this;

        if (labels.length) {
            const valueAxis = this.options.vertical ? Y : X;
            const start = box[valueAxis + 1];
            const end = box[valueAxis + 2];
            const firstLabel = labels[0];
            const lastLabel = last(labels);

            if (firstLabel.box[valueAxis + 1] > end || firstLabel.box[valueAxis + 2] < start) {
                firstLabel.options.visible = false;
            }
            if (lastLabel.box[valueAxis + 1] > end || lastLabel.box[valueAxis + 2] < start) {
                lastLabel.options.visible = false;
            }
        }
    }

    getMajorTickPositions() {
        return this.getTicks().majorTicks;
    }

    getMinorTickPositions() {
        return this.getTicks().minorTicks;
    }

    getLabelsTickPositions() {
        return this.getTicks().labelTicks;
    }

    tickIndices(stepSize) {
        const { min, max } = this.rangeIndices();
        const limit = Math.ceil(max);
        let current = Math.floor(min);
        const indices = [];

        while (current <= limit) {
            indices.push(current);
            current += stepSize;
        }

        return indices;
    }

    getTickPositions(stepSize) {
        const { vertical, reverse } = this.options;
        const { scale, box, min } = this.scaleOptions();
        const pos = box[(vertical ? Y : X) + (reverse ? 2 : 1)];
        const indices = this.tickIndices(stepSize);
        const positions = [];

        for (let idx = 0; idx < indices.length; idx++) {
            positions.push(pos + round(scale * (indices[idx] - min), COORD_PRECISION));
        }

        return positions;
    }

    getTicks() {
        const options = this.options;
        const cache = this._ticks;
        const range = this.rangeIndices();
        const lineBox = this.lineBox();
        const hash = lineBox.getHash() + range.min + "," + range.max + options.reverse + options.justified;

        if (cache._hash !== hash) {
            const hasMinor = options.minorTicks.visible || options.minorGridLines.visible;
            cache._hash = hash;
            cache.labelTicks = this.getTickPositions(1);
            cache.majorTicks = this.filterOutOfRangePositions(cache.labelTicks, lineBox);
            cache.minorTicks = hasMinor ? this.filterOutOfRangePositions(this.getTickPositions(0.5), lineBox) : [];
        }

        return cache;
    }

    filterOutOfRangePositions(positions, lineBox) {
        if (!positions.length) {
            return positions;
        }

        const axis = this.options.vertical ? Y : X;
        const inRange = (position) => lineBox[axis + 1] <= position && position <= lineBox[axis + 2];

        const end = positions.length - 1;
        let startIndex = 0;
        while (!inRange(positions[startIndex]) && startIndex <= end) {
            startIndex++;
        }

        let endIndex = end;

        while (!inRange(positions[endIndex]) && endIndex >= 0) {
            endIndex--;
        }

        return positions.slice(startIndex, endIndex + 1);
    }

    getSlot(from, to, limit) {
        const options = this.options;
        const { reverse, justified, vertical } = options;
        const { scale, box, min } = this.scaleOptions();
        const valueAxis = vertical ? Y : X;
        const lineStart = box[valueAxis + (reverse ? 2 : 1)];
        const slotBox = box.clone();
        const singleSlot = !defined(to);

        const start = valueOrDefault(from, 0);
        let end = valueOrDefault(to, start);
        end = Math.max(end - 1, start);

        // Fixes transient bug caused by iOS 6.0 JIT
        // (one can never be too sure)
        end = Math.max(start, end);

        let p1 = lineStart + (start - min) * scale;
        let p2 = lineStart + (end + 1 - min) * scale;

        if (singleSlot && justified) {
            p2 = p1;
        }

        if (limit) {
            p1 = limitValue(p1, box[valueAxis + 1], box[valueAxis + 2]);
            p2 = limitValue(p2, box[valueAxis + 1], box[valueAxis + 2]);
        }

        slotBox[valueAxis + 1] = reverse ? p2 : p1;
        slotBox[valueAxis + 2] = reverse ? p1 : p2;

        return slotBox;
    }

    limitSlot(slot) {
        const vertical = this.options.vertical;
        const valueAxis = vertical ? Y : X;
        const lineBox = this.lineBox();
        const limittedSlot = slot.clone();

        limittedSlot[valueAxis + 1] = limitValue(slot[valueAxis + 1], lineBox[valueAxis + 1], lineBox[valueAxis + 2]);
        limittedSlot[valueAxis + 2] = limitValue(slot[valueAxis + 2], lineBox[valueAxis + 1], lineBox[valueAxis + 2]);

        return limittedSlot;
    }

    slot(from, to, limit) {
        const min = Math.floor(this.options.min || 0);
        let start = from;
        let end = to;

        if (typeof start === "string") {
            start = this.categoryIndex(start);
        } else if (isNumber(start)) {
            start -= min;
        }

        if (typeof end === "string") {
            end = this.categoryIndex(end);
        } else if (isNumber(end)) {
            end -= min;
        }

        return super.slot(start, end, limit);
    }

    pointCategoryIndex(point) {
        const { reverse, justified, vertical } = this.options;
        const valueAxis = vertical ? Y : X;
        const { scale, box, min, max } = this.scaleOptions();
        const startValue = reverse ? max : min;
        const lineStart = box[valueAxis + 1];
        const lineEnd = box[valueAxis + 2];
        const pos = point[valueAxis];

        if (pos < lineStart || pos > lineEnd) {
            return null;
        }

        let value = startValue + (pos - lineStart) / scale;
        const diff = value % 1;

        if (justified) {
            value = Math.round(value);
        } else if (diff === 0 && value > 0) {
            value--;
        }

        return Math.floor(value);
    }

    getCategory(point) {
        const index = this.pointCategoryIndex(point);

        if (index === null) {
            return null;
        }

        return this.options.categories[index];
    }

    categoryIndex(value) {
        return this.totalIndex(value) - Math.floor(this.options.min || 0);
    }

    categoryAt(index, total) {
        const options = this.options;

        return (total ? options.srcCategories : options.categories)[index];
    }

    categoriesCount() {
        return (this.options.categories || []).length;
    }

    translateRange(delta) {
        const options = this.options;
        const lineBox = this.lineBox();
        const size = options.vertical ? lineBox.height() : lineBox.width();
        const range = options.categories.length;
        const scale = size / range;
        const offset = round(delta / scale, DEFAULT_PRECISION);

        return {
            min: offset,
            max: range + offset
        };
    }

    zoomRange(rate) {
        const rangeIndices = this.totalRangeIndices();
        const { min: totalMin, max: totalMax } = this.totalRange();
        const min = limitValue(rangeIndices.min + rate, totalMin, totalMax);
        const max = limitValue(rangeIndices.max - rate, totalMin, totalMax);

        if (max - min > 0) {
            return {
                min: min,
                max: max
            };
        }
    }

    scaleRange(scale) {
        const range = this.options.categories.length;
        const delta = scale * range;

        return {
            min: -delta,
            max: range + delta
        };
    }

    labelsCount() {
        const labelsRange = this.labelsRange();

        return labelsRange.max - labelsRange.min;
    }

    labelsRange() {
        const options = this.options;
        const { justified, labels: labelOptions } = options;
        let { min, max } = this.totalRangeIndices(true);
        const start = Math.floor(min);

        if (!justified) {
            min = Math.floor(min);
            max = Math.ceil(max);
        } else {
            min = Math.ceil(min);
            max = Math.floor(max);
        }

        let skip;

        if (min > labelOptions.skip) {
            skip = labelOptions.skip + labelOptions.step * Math.ceil((min - labelOptions.skip) / labelOptions.step);
        } else {
            skip = labelOptions.skip;
        }

        return {
            min: skip - start,
            max: (options.categories.length ? max + (justified ? 1 : 0) : 0) - start
        };
    }

    createAxisLabel(index, labelOptions) {
        const options = this.options;
        const dataItem = options.dataItems ? options.dataItems[index] : null;
        const category = valueOrDefault(options.categories[index], "");
        const text = this.axisLabelText(category, dataItem, labelOptions);

        return new AxisLabel(category, text, index, dataItem, labelOptions);
    }

    shouldRenderNote(value) {
        const range = this.totalRangeIndices();

        return Math.floor(range.min) <= value && value <= Math.ceil(range.max);
    }

    noteSlot(value) {
        const options = this.options;
        const index = value - Math.floor(options.min || 0);
        return this.getSlot(index);
    }

    arrangeNotes() {
        super.arrangeNotes();
        this.hideOutOfRangeNotes();
    }

    hideOutOfRangeNotes() {
        const { notes, box } = this;
        if (notes && notes.length) {
            const valueAxis = this.options.vertical ? Y : X;
            const start = box[valueAxis + 1];
            const end = box[valueAxis + 2];

            for (let idx = 0; idx < notes.length; idx++) {
                const note = notes[idx];
                if (note.box && (end < note.box[valueAxis + 1] || note.box[valueAxis + 2] < start)) {
                    note.hide();
                }
            }
        }
    }

    pan(delta) {
        const range = this.totalRangeIndices(true);
        const { scale } = this.scaleOptions();
        const offset = round(delta / scale, DEFAULT_PRECISION);
        const totalRange = this.totalRange();
        const min = range.min + offset;
        const max = range.max + offset;

        return this.limitRange(min, max, 0, totalRange.max, offset);
    }

    pointsRange(start, end) {
        const { reverse, vertical } = this.options;
        const valueAxis = vertical ? Y : X;
        const range = this.totalRangeIndices(true);
        const { scale, box } = this.scaleOptions();
        const lineStart = box[valueAxis + (reverse ? 2 : 1)];

        const diffStart = start[valueAxis] - lineStart;
        const diffEnd = end[valueAxis] - lineStart;

        const min = range.min + diffStart / scale;
        const max = range.min + diffEnd / scale;
        const rangeMin = Math.min(min, max);
        const rangeMax = Math.max(min, max);

        if (rangeMax - rangeMin >= MIN_CATEGORY_POINTS_RANGE) {
            return {
                min: rangeMin,
                max: rangeMax
            };
        }
    }

    valueRange() {
        return this.range();
    }

    totalIndex(value) {
        const options = this.options;
        const index = this._categoriesMap ?
            this._categoriesMap.get(value) : indexOf(value, options.srcCategories);

        return index;
    }

    currentRangeIndices() {
        const options = this.options;
        let min = 0;

        if (isNumber(options.min)) {
            min = Math.floor(options.min);
        }

        let max;
        if (isNumber(options.max)) {
            max = options.justified ? Math.floor(options.max) : Math.ceil(options.max) - 1;
        } else {
            max = this.totalCount() - 1;
        }

        return {
            min: min,
            max: max
        };
    }

    mapCategories() {
        if (!this._categoriesMap) {
            const map = this._categoriesMap = new HashMap();
            const srcCategories = this.options.srcCategories;
            for (let idx = 0; idx < srcCategories.length; idx++) {
                map.set(srcCategories[idx], idx);
            }
        }
    }

    totalCount() {
        return Math.max(this.options.srcCategories.length, this._seriesMax || 0);
    }
}

setDefaultOptions(CategoryAxis, {
    type: "category",
    vertical: false,
    majorGridLines: {
        visible: false,
        width: 1,
        color: BLACK
    },
    labels: {
        zIndex: 1
    },
    justified: false,
    _deferLabels: true
});

export default CategoryAxis;
