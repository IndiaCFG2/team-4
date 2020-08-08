import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import TextBox from './text-box';
import AxisLabel from './axis-label';
import Note from './note';
import Box from './box';
import { ChartService } from '../services';

import createAxisTick from './utils/create-axis-tick';
import createAxisGridLine from './utils/create-axis-grid-line';

import { NONE, BLACK, CENTER, TOP, BOTTOM, LEFT, RIGHT, OUTSIDE, X, Y, WIDTH, HEIGHT } from '../common/constants';
import { alignPathToPixel, deepExtend, getTemplate, grep, defined, isObject, inArray, limitValue, round, setDefaultOptions } from '../common';

class Axis extends ChartElement {
    constructor(options, chartService = new ChartService()) {
        super(options);

        this.chartService = chartService;

        if (!this.options.visible) {
            this.options = deepExtend({}, this.options, {
                labels: {
                    visible: false
                },
                line: {
                    visible: false
                },
                margin: 0,
                majorTickSize: 0,
                minorTickSize: 0
            });
        }

        this.options.minorTicks = deepExtend({}, {
            color: this.options.line.color,
            width: this.options.line.width,
            visible: this.options.minorTickType !== NONE
        }, this.options.minorTicks, {
            size: this.options.minorTickSize,
            align: this.options.minorTickType
        });

        this.options.majorTicks = deepExtend({}, {
            color: this.options.line.color,
            width: this.options.line.width,
            visible: this.options.majorTickType !== NONE
        }, this.options.majorTicks, {
            size: this.options.majorTickSize,
            align: this.options.majorTickType
        });

        this.initFields();

        if (!this.options._deferLabels) {
            this.createLabels();
        }

        this.createTitle();
        this.createNotes();
    }

    initFields() {
    }

    // abstract labelsCount(): Number
    // abstract createAxisLabel(index, options): AxisLabel

    labelsRange() {
        return {
            min: this.options.labels.skip,
            max: this.labelsCount()
        };
    }

    createLabels() {
        const options = this.options;
        const align = options.vertical ? RIGHT : CENTER;
        const labelOptions = deepExtend({ }, options.labels, {
            align: align,
            zIndex: options.zIndex
        });
        const step = Math.max(1, labelOptions.step);

        this.clearLabels();

        if (labelOptions.visible) {
            const range = this.labelsRange();
            const rotation = labelOptions.rotation;

            if (isObject(rotation)) {
                labelOptions.alignRotation = rotation.align;
                labelOptions.rotation = rotation.angle;
            }

            if (labelOptions.rotation === "auto") {
                labelOptions.rotation = 0;
                options.autoRotateLabels = true;
            }

            for (let idx = range.min; idx < range.max; idx += step) {
                let label = this.createAxisLabel(idx, labelOptions);
                if (label) {
                    this.append(label);
                    this.labels.push(label);
                }
            }
        }
    }

    clearLabels() {
        this.children = grep(this.children, child => !(child instanceof AxisLabel));
        this.labels = [];
    }

    clearTitle() {
        if (this.title) {
            this.children = grep(this.children, child => child !== this.title);
            this.title = undefined;
        }
    }

    clear() {
        this.clearLabels();
        this.clearTitle();
    }

    lineBox() {
        const { options, box } = this;
        const vertical = options.vertical;
        const mirror = options.labels.mirror;
        const axisX = mirror ? box.x1 : box.x2;
        const axisY = mirror ? box.y2 : box.y1;
        const lineWidth = options.line.width || 0;

        return vertical ?
            new Box(axisX, box.y1, axisX, box.y2 - lineWidth) :
            new Box(box.x1, axisY, box.x2 - lineWidth, axisY);
    }

    createTitle() {
        const options = this.options;
        const titleOptions = deepExtend({
            rotation: options.vertical ? -90 : 0,
            text: "",
            zIndex: 1,
            visualSize: true
        }, options.title);

        if (titleOptions.visible && titleOptions.text) {
            const title = new TextBox(titleOptions.text, titleOptions);
            this.append(title);
            this.title = title;
        }
    }

    createNotes() {
        const options = this.options;
        const notes = options.notes;
        const items = notes.data || [];

        this.notes = [];

        for (let i = 0; i < items.length; i++) {
            const item = deepExtend({}, notes, items[i]);
            item.value = this.parseNoteValue(item.value);

            const note = new Note({
                value: item.value,
                text: item.label.text,
                dataItem: item
            }, item, this.chartService);

            if (note.options.visible) {
                if (defined(note.options.position)) {
                    if (options.vertical && !inArray(note.options.position, [ LEFT, RIGHT ])) {
                        note.options.position = options.reverse ? LEFT : RIGHT;
                    } else if (!options.vertical && !inArray(note.options.position, [ TOP, BOTTOM ])) {
                        note.options.position = options.reverse ? BOTTOM : TOP;
                    }
                } else {
                    if (options.vertical) {
                        note.options.position = options.reverse ? LEFT : RIGHT;
                    } else {
                        note.options.position = options.reverse ? BOTTOM : TOP;
                    }
                }
                this.append(note);
                this.notes.push(note);
            }
        }
    }

    parseNoteValue(value) {
        return value;
    }

    renderVisual() {
        super.renderVisual();

        this.createPlotBands();
    }

    createVisual() {
        super.createVisual();

        this.createBackground();
        this.createLine();
    }

    gridLinesVisual() {
        let gridLines = this._gridLines;
        if (!gridLines) {
            gridLines = this._gridLines = new draw.Group({
                zIndex: -2
            });
            this.appendVisual(this._gridLines);
        }

        return gridLines;
    }

    createTicks(lineGroup) {
        const options = this.options;
        const lineBox = this.lineBox();
        const mirror = options.labels.mirror;
        const majorUnit = options.majorTicks.visible ? options.majorUnit : 0;
        const tickLineOptions = {
            // TODO
            // _alignLines: options._alignLines,
            vertical: options.vertical
        };

        function render(tickPositions, tickOptions, skipUnit) {
            const count = tickPositions.length;
            const step = Math.max(1, tickOptions.step);

            if (tickOptions.visible) {
                for (let i = tickOptions.skip; i < count; i += step) {
                    if (defined(skipUnit) && (i % skipUnit === 0)) {
                        continue;
                    }

                    tickLineOptions.tickX = mirror ? lineBox.x2 : lineBox.x2 - tickOptions.size;
                    tickLineOptions.tickY = mirror ? lineBox.y1 - tickOptions.size : lineBox.y1;
                    tickLineOptions.position = tickPositions[i];

                    lineGroup.append(createAxisTick(tickLineOptions, tickOptions));
                }
            }
        }

        render(this.getMajorTickPositions(), options.majorTicks);
        render(this.getMinorTickPositions(), options.minorTicks, majorUnit / options.minorUnit);
    }

    createLine() {
        const options = this.options;
        const line = options.line;
        const lineBox = this.lineBox();

        if (line.width > 0 && line.visible) {
            const path = new draw.Path({
                stroke: {
                    width: line.width,
                    color: line.color,
                    dashType: line.dashType
                }

                /* TODO
                zIndex: line.zIndex,
                */
            });

            path.moveTo(lineBox.x1, lineBox.y1)
                .lineTo(lineBox.x2, lineBox.y2);

            if (options._alignLines) {
                alignPathToPixel(path);
            }

            const group = this._lineGroup = new draw.Group();
            group.append(path);

            this.visual.append(group);
            this.createTicks(group);
        }
    }

    getActualTickSize() {
        const options = this.options;
        let tickSize = 0;

        if (options.majorTicks.visible && options.minorTicks.visible) {
            tickSize = Math.max(options.majorTicks.size, options.minorTicks.size);
        } else if (options.majorTicks.visible) {
            tickSize = options.majorTicks.size;
        } else if (options.minorTicks.visible) {
            tickSize = options.minorTicks.size;
        }

        return tickSize;
    }

    createBackground() {
        const { options, box } = this;
        const background = options.background;

        if (background) {
            this._backgroundPath = draw.Path.fromRect(box.toRect(), {
                fill: {
                    color: background
                },
                stroke: null
            });

            this.visual.append(this._backgroundPath);
        }
    }

    createPlotBands() {
        const options = this.options;
        const plotBands = options.plotBands || [];
        const vertical = options.vertical;
        const plotArea = this.plotArea;

        if (plotBands.length === 0) {
            return;
        }

        const group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        const altAxis = grep(this.pane.axes, axis => axis.options.vertical !== this.options.vertical)[0];

        for (let idx = 0; idx < plotBands.length; idx++) {
            let item = plotBands[idx];
            let slotX, slotY;

            if (vertical) {
                slotX = (altAxis || plotArea.axisX).lineBox();
                slotY = this.getSlot(item.from, item.to, true);
            } else {
                slotX = this.getSlot(item.from, item.to, true);
                slotY = (altAxis || plotArea.axisY).lineBox();
            }

            if (slotX.width() !== 0 && slotY.height() !== 0) {
                const bandRect = new geom.Rect(
                    [ slotX.x1, slotY.y1 ],
                    [ slotX.width(), slotY.height() ]
                );

                const path = draw.Path.fromRect(bandRect, {
                    fill: {
                        color: item.color,
                        opacity: item.opacity
                    },
                    stroke: null
                });

                group.append(path);
            }
        }

        this.appendVisual(group);
    }

    createGridLines(altAxis) {
        const options = this.options;
        const { minorGridLines, majorGridLines, minorUnit, vertical } = options;
        const axisLineVisible = altAxis.options.line.visible;
        const majorUnit = majorGridLines.visible ? options.majorUnit : 0;
        const lineBox = altAxis.lineBox();
        const linePos = lineBox[vertical ? "y1" : "x1"];
        const lineOptions = {
            lineStart: lineBox[vertical ? "x1" : "y1"],
            lineEnd: lineBox[vertical ? "x2" : "y2"],
            vertical: vertical
        };
        const majorTicks = [];

        const container = this.gridLinesVisual();

        function render(tickPositions, gridLine, skipUnit) {
            const count = tickPositions.length;
            const step = Math.max(1, gridLine.step);

            if (gridLine.visible) {
                for (let i = gridLine.skip; i < count; i += step) {
                    let pos = round(tickPositions[i]);
                    if (!inArray(pos, majorTicks)) {
                        if (i % skipUnit !== 0 && (!axisLineVisible || linePos !== pos)) {
                            lineOptions.position = pos;
                            container.append(createAxisGridLine(lineOptions, gridLine));

                            majorTicks.push(pos);
                        }
                    }
                }
            }
        }

        render(this.getMajorTickPositions(), majorGridLines);
        render(this.getMinorTickPositions(), minorGridLines, majorUnit / minorUnit);

        return container.children;
    }

    reflow(box) {
        const { options, labels, title } = this;
        const vertical = options.vertical;
        const count = labels.length;
        const sizeFn = vertical ? WIDTH : HEIGHT;
        const titleSize = title ? title.box[sizeFn]() : 0;
        const space = this.getActualTickSize() + options.margin + titleSize;
        const rootBox = (this.getRoot() || {}).box || box;
        const boxSize = rootBox[sizeFn]();
        let maxLabelSize = 0;

        for (let i = 0; i < count; i++) {
            let labelSize = labels[i].box[sizeFn]();
            if (labelSize + space <= boxSize) {
                maxLabelSize = Math.max(maxLabelSize, labelSize);
            }
        }

        if (vertical) {
            this.box = new Box(
                box.x1, box.y1,
                box.x1 + maxLabelSize + space, box.y2
            );
        } else {
            this.box = new Box(
                box.x1, box.y1,
                box.x2, box.y1 + maxLabelSize + space
            );
        }

        this.arrangeTitle();
        this.arrangeLabels();
        this.arrangeNotes();
    }

    getLabelsTickPositions() {
        return this.getMajorTickPositions();
    }

    labelTickIndex(label) {
        return label.index;
    }

    arrangeLabels() {
        const { options, labels } = this;
        const labelsBetweenTicks = this.labelsBetweenTicks();
        const vertical = options.vertical;
        const lineBox = this.lineBox();
        const mirror = options.labels.mirror;
        const tickPositions = this.getLabelsTickPositions();
        const labelOffset = this.getActualTickSize() + options.margin;

        for (let idx = 0; idx < labels.length; idx++) {
            const label = labels[idx];
            const tickIx = this.labelTickIndex(label);
            const labelSize = vertical ? label.box.height() : label.box.width();
            let labelPos = tickPositions[tickIx] - (labelSize / 2);
            let labelBox, firstTickPosition, nextTickPosition;

            if (vertical) {
                if (labelsBetweenTicks) {
                    firstTickPosition = tickPositions[tickIx];
                    nextTickPosition = tickPositions[tickIx + 1];

                    let middle = firstTickPosition + (nextTickPosition - firstTickPosition) / 2;
                    labelPos = middle - (labelSize / 2);
                }

                let labelX = lineBox.x2;

                if (mirror) {
                    labelX += labelOffset;
                    label.options.rotationOrigin = LEFT;
                } else {
                    labelX -= labelOffset + label.box.width();
                    label.options.rotationOrigin = RIGHT;
                }

                labelBox = label.box.move(labelX, labelPos);
            } else {
                if (labelsBetweenTicks) {
                    firstTickPosition = tickPositions[tickIx];
                    nextTickPosition = tickPositions[tickIx + 1];
                } else {
                    firstTickPosition = labelPos;
                    nextTickPosition = labelPos + labelSize;
                }

                let labelY = lineBox.y1;

                if (mirror) {
                    labelY -= labelOffset + label.box.height();
                    label.options.rotationOrigin = BOTTOM;
                } else {
                    labelY += labelOffset;
                    label.options.rotationOrigin = TOP;
                }

                labelBox = new Box(firstTickPosition, labelY,
                                nextTickPosition, labelY + label.box.height());
            }

            label.reflow(labelBox);
        }
    }

    autoRotateLabels() {
        if (this.options.autoRotateLabels && !this.options.vertical) {
            const tickPositions = this.getMajorTickPositions();
            const labels = this.labels;
            let angle;

            for (let idx = 0; idx < labels.length; idx++) {
                const width = Math.abs(tickPositions[idx + 1] - tickPositions[idx]);
                const labelBox = labels[idx].box;

                if (labelBox.width() > width) {
                    if (labelBox.height() > width) {
                        angle = -90;
                        break;
                    }
                    angle = -45;
                }
            }

            if (angle) {
                for (let idx = 0; idx < labels.length; idx++) {
                    labels[idx].options.rotation = angle;
                    labels[idx].reflow(new Box());
                }
                return true;
            }
        }
    }

    arrangeTitle() {
        const { options, title } = this;
        const mirror = options.labels.mirror;
        const vertical = options.vertical;

        if (title) {
            if (vertical) {
                title.options.align = mirror ? RIGHT : LEFT;
                title.options.vAlign = title.options.position;
            } else {
                title.options.align = title.options.position;
                title.options.vAlign = mirror ? TOP : BOTTOM;
            }

            title.reflow(this.box);
        }
    }

    arrangeNotes() {
        for (let idx = 0; idx < this.notes.length; idx++) {
            const item = this.notes[idx];
            const value = item.options.value;
            let slot;

            if (defined(value)) {
                if (this.shouldRenderNote(value)) {
                    item.show();
                } else {
                    item.hide();
                }

                slot = this.noteSlot(value);
            } else {
                item.hide();
            }

            item.reflow(slot || this.lineBox());
        }
    }

    noteSlot(value) {
        return this.getSlot(value);
    }

    alignTo(secondAxis) {
        const lineBox = secondAxis.lineBox();
        const vertical = this.options.vertical;
        const pos = vertical ? Y : X;

        this.box.snapTo(lineBox, pos);
        if (vertical) {
            this.box.shrink(0, this.lineBox().height() - lineBox.height());
        } else {
            this.box.shrink(this.lineBox().width() - lineBox.width(), 0);
        }
        this.box[pos + 1] -= this.lineBox()[pos + 1] - lineBox[pos + 1];
        this.box[pos + 2] -= this.lineBox()[pos + 2] - lineBox[pos + 2];
    }

    axisLabelText(value, dataItem, options) {
        const tmpl = getTemplate(options);
        let text = value;

        if (tmpl) {
            text = tmpl({ value: value, dataItem: dataItem, format: options.format, culture: options.culture });
        } else if (options.format) {
            text = this.chartService.format.localeAuto(options.format, [ value ], options.culture);
        }

        return text;
    }

    slot(from , to, limit) {
        const slot = this.getSlot(from, to, limit);
        if (slot) {
            return slot.toRect();
        }
    }

    contentBox() {
        const box = this.box.clone();
        const labels = this.labels;
        if (labels.length) {
            const axis = this.options.vertical ? Y : X;
            if (this.chartService.isPannable(axis)) {
                const offset = this.maxLabelOffset();
                box[axis + 1] -= offset.start;
                box[axis + 2] += offset.end;
            } else {
                if (labels[0].options.visible) {
                    box.wrap(labels[0].box);
                }
                const lastLabel = labels[labels.length - 1];
                if (lastLabel.options.visible) {
                    box.wrap(lastLabel.box);
                }
            }
        }

        return box;
    }

    maxLabelOffset() {
        const { vertical, reverse } = this.options;
        const labelsBetweenTicks = this.labelsBetweenTicks();
        const tickPositions = this.getLabelsTickPositions();
        const offsetField = vertical ? Y : X;
        const labels = this.labels;
        const startPosition = reverse ? 1 : 0;
        const endPosition = reverse ? 0 : 1;
        let maxStartOffset = 0;
        let maxEndOffset = 0;

        for (let idx = 0; idx < labels.length; idx++) {
            const label = labels[idx];
            const tickIx = this.labelTickIndex(label);
            let startTick, endTick;

            if (labelsBetweenTicks) {
                startTick = tickPositions[tickIx + startPosition];
                endTick = tickPositions[tickIx + endPosition];
            } else {
                startTick = endTick = tickPositions[tickIx];
            }

            maxStartOffset = Math.max(maxStartOffset, startTick - label.box[offsetField + 1]);
            maxEndOffset = Math.max(maxEndOffset, label.box[offsetField + 2] - endTick);
        }

        return {
            start: maxStartOffset,
            end: maxEndOffset
        };
    }

    limitRange(from, to, min, max, offset) {
        const options = this.options;

        if ((from < min && offset < 0 && (!defined(options.min) || options.min <= min)) || (max < to && offset > 0 && (!defined(options.max) || max <= options.max))) {
            return null;
        }

        if ((to < min && offset > 0) || (max < from && offset < 0)) {
            return {
                min: from,
                max: to
            };
        }

        const rangeSize = to - from;
        let minValue = from;
        let maxValue = to;

        if (from < min && offset < 0) {
            minValue = limitValue(from, min, max);
            maxValue = limitValue(from + rangeSize, min + rangeSize, max);
        } else if (to > max && offset > 0) {
            maxValue = limitValue(to, min, max);
            minValue = limitValue(to - rangeSize, min, max - rangeSize);
        }

        return {
            min: minValue,
            max: maxValue
        };
    }

    valueRange() {
        return {
            min: this.seriesMin,
            max: this.seriesMax
        };
    }

    labelsBetweenTicks() {
        return !this.options.justified;
    }

    //add legacy fields to the options that are no longer generated by default
    prepareUserOptions() {
    }
}

setDefaultOptions(Axis, {
    labels: {
        visible: true,
        rotation: 0,
        mirror: false,
        step: 1,
        skip: 0
    },
    line: {
        width: 1,
        color: BLACK,
        visible: true
    },
    title: {
        visible: true,
        position: CENTER
    },
    majorTicks: {
        align: OUTSIDE,
        size: 4,
        skip: 0,
        step: 1
    },
    minorTicks: {
        align: OUTSIDE,
        size: 3,
        skip: 0,
        step: 1
    },
    axisCrossingValue: 0,
    majorTickType: OUTSIDE,
    minorTickType: NONE,
    majorGridLines: {
        skip: 0,
        step: 1
    },
    minorGridLines: {
        visible: false,
        width: 1,
        color: BLACK,
        skip: 0,
        step: 1
    },
    // TODO: Move to line or labels options
    margin: 5,
    visible: true,
    reverse: false,
    justified: true,
    notes: {
        label: {
            text: ""
        }
    },

    _alignLines: true,
    _deferLabels: false
});

export default Axis;
