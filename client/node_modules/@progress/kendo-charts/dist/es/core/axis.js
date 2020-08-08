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

var Axis = (function (ChartElement) {
    function Axis(options, chartService) {
        if ( chartService === void 0 ) chartService = new ChartService();

        ChartElement.call(this, options);

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

    if ( ChartElement ) Axis.__proto__ = ChartElement;
    Axis.prototype = Object.create( ChartElement && ChartElement.prototype );
    Axis.prototype.constructor = Axis;

    Axis.prototype.initFields = function initFields () {
    };

    // abstract labelsCount(): Number
    // abstract createAxisLabel(index, options): AxisLabel

    Axis.prototype.labelsRange = function labelsRange () {
        return {
            min: this.options.labels.skip,
            max: this.labelsCount()
        };
    };

    Axis.prototype.createLabels = function createLabels () {
        var this$1 = this;

        var options = this.options;
        var align = options.vertical ? RIGHT : CENTER;
        var labelOptions = deepExtend({ }, options.labels, {
            align: align,
            zIndex: options.zIndex
        });
        var step = Math.max(1, labelOptions.step);

        this.clearLabels();

        if (labelOptions.visible) {
            var range = this.labelsRange();
            var rotation = labelOptions.rotation;

            if (isObject(rotation)) {
                labelOptions.alignRotation = rotation.align;
                labelOptions.rotation = rotation.angle;
            }

            if (labelOptions.rotation === "auto") {
                labelOptions.rotation = 0;
                options.autoRotateLabels = true;
            }

            for (var idx = range.min; idx < range.max; idx += step) {
                var label = this$1.createAxisLabel(idx, labelOptions);
                if (label) {
                    this$1.append(label);
                    this$1.labels.push(label);
                }
            }
        }
    };

    Axis.prototype.clearLabels = function clearLabels () {
        this.children = grep(this.children, function (child) { return !(child instanceof AxisLabel); });
        this.labels = [];
    };

    Axis.prototype.clearTitle = function clearTitle () {
        var this$1 = this;

        if (this.title) {
            this.children = grep(this.children, function (child) { return child !== this$1.title; });
            this.title = undefined;
        }
    };

    Axis.prototype.clear = function clear () {
        this.clearLabels();
        this.clearTitle();
    };

    Axis.prototype.lineBox = function lineBox () {
        var ref = this;
        var options = ref.options;
        var box = ref.box;
        var vertical = options.vertical;
        var mirror = options.labels.mirror;
        var axisX = mirror ? box.x1 : box.x2;
        var axisY = mirror ? box.y2 : box.y1;
        var lineWidth = options.line.width || 0;

        return vertical ?
            new Box(axisX, box.y1, axisX, box.y2 - lineWidth) :
            new Box(box.x1, axisY, box.x2 - lineWidth, axisY);
    };

    Axis.prototype.createTitle = function createTitle () {
        var options = this.options;
        var titleOptions = deepExtend({
            rotation: options.vertical ? -90 : 0,
            text: "",
            zIndex: 1,
            visualSize: true
        }, options.title);

        if (titleOptions.visible && titleOptions.text) {
            var title = new TextBox(titleOptions.text, titleOptions);
            this.append(title);
            this.title = title;
        }
    };

    Axis.prototype.createNotes = function createNotes () {
        var this$1 = this;

        var options = this.options;
        var notes = options.notes;
        var items = notes.data || [];

        this.notes = [];

        for (var i = 0; i < items.length; i++) {
            var item = deepExtend({}, notes, items[i]);
            item.value = this$1.parseNoteValue(item.value);

            var note = new Note({
                value: item.value,
                text: item.label.text,
                dataItem: item
            }, item, this$1.chartService);

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
                this$1.append(note);
                this$1.notes.push(note);
            }
        }
    };

    Axis.prototype.parseNoteValue = function parseNoteValue (value) {
        return value;
    };

    Axis.prototype.renderVisual = function renderVisual () {
        ChartElement.prototype.renderVisual.call(this);

        this.createPlotBands();
    };

    Axis.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);

        this.createBackground();
        this.createLine();
    };

    Axis.prototype.gridLinesVisual = function gridLinesVisual () {
        var gridLines = this._gridLines;
        if (!gridLines) {
            gridLines = this._gridLines = new draw.Group({
                zIndex: -2
            });
            this.appendVisual(this._gridLines);
        }

        return gridLines;
    };

    Axis.prototype.createTicks = function createTicks (lineGroup) {
        var options = this.options;
        var lineBox = this.lineBox();
        var mirror = options.labels.mirror;
        var majorUnit = options.majorTicks.visible ? options.majorUnit : 0;
        var tickLineOptions = {
            // TODO
            // _alignLines: options._alignLines,
            vertical: options.vertical
        };

        function render(tickPositions, tickOptions, skipUnit) {
            var count = tickPositions.length;
            var step = Math.max(1, tickOptions.step);

            if (tickOptions.visible) {
                for (var i = tickOptions.skip; i < count; i += step) {
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
    };

    Axis.prototype.createLine = function createLine () {
        var options = this.options;
        var line = options.line;
        var lineBox = this.lineBox();

        if (line.width > 0 && line.visible) {
            var path = new draw.Path({
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

            var group = this._lineGroup = new draw.Group();
            group.append(path);

            this.visual.append(group);
            this.createTicks(group);
        }
    };

    Axis.prototype.getActualTickSize = function getActualTickSize () {
        var options = this.options;
        var tickSize = 0;

        if (options.majorTicks.visible && options.minorTicks.visible) {
            tickSize = Math.max(options.majorTicks.size, options.minorTicks.size);
        } else if (options.majorTicks.visible) {
            tickSize = options.majorTicks.size;
        } else if (options.minorTicks.visible) {
            tickSize = options.minorTicks.size;
        }

        return tickSize;
    };

    Axis.prototype.createBackground = function createBackground () {
        var ref = this;
        var options = ref.options;
        var box = ref.box;
        var background = options.background;

        if (background) {
            this._backgroundPath = draw.Path.fromRect(box.toRect(), {
                fill: {
                    color: background
                },
                stroke: null
            });

            this.visual.append(this._backgroundPath);
        }
    };

    Axis.prototype.createPlotBands = function createPlotBands () {
        var this$1 = this;

        var options = this.options;
        var plotBands = options.plotBands || [];
        var vertical = options.vertical;
        var plotArea = this.plotArea;

        if (plotBands.length === 0) {
            return;
        }

        var group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        var altAxis = grep(this.pane.axes, function (axis) { return axis.options.vertical !== this$1.options.vertical; })[0];

        for (var idx = 0; idx < plotBands.length; idx++) {
            var item = plotBands[idx];
            var slotX = (void 0), slotY = (void 0);

            if (vertical) {
                slotX = (altAxis || plotArea.axisX).lineBox();
                slotY = this$1.getSlot(item.from, item.to, true);
            } else {
                slotX = this$1.getSlot(item.from, item.to, true);
                slotY = (altAxis || plotArea.axisY).lineBox();
            }

            if (slotX.width() !== 0 && slotY.height() !== 0) {
                var bandRect = new geom.Rect(
                    [ slotX.x1, slotY.y1 ],
                    [ slotX.width(), slotY.height() ]
                );

                var path = draw.Path.fromRect(bandRect, {
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
    };

    Axis.prototype.createGridLines = function createGridLines (altAxis) {
        var options = this.options;
        var minorGridLines = options.minorGridLines;
        var majorGridLines = options.majorGridLines;
        var minorUnit = options.minorUnit;
        var vertical = options.vertical;
        var axisLineVisible = altAxis.options.line.visible;
        var majorUnit = majorGridLines.visible ? options.majorUnit : 0;
        var lineBox = altAxis.lineBox();
        var linePos = lineBox[vertical ? "y1" : "x1"];
        var lineOptions = {
            lineStart: lineBox[vertical ? "x1" : "y1"],
            lineEnd: lineBox[vertical ? "x2" : "y2"],
            vertical: vertical
        };
        var majorTicks = [];

        var container = this.gridLinesVisual();

        function render(tickPositions, gridLine, skipUnit) {
            var count = tickPositions.length;
            var step = Math.max(1, gridLine.step);

            if (gridLine.visible) {
                for (var i = gridLine.skip; i < count; i += step) {
                    var pos = round(tickPositions[i]);
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
    };

    Axis.prototype.reflow = function reflow (box) {
        var ref = this;
        var options = ref.options;
        var labels = ref.labels;
        var title = ref.title;
        var vertical = options.vertical;
        var count = labels.length;
        var sizeFn = vertical ? WIDTH : HEIGHT;
        var titleSize = title ? title.box[sizeFn]() : 0;
        var space = this.getActualTickSize() + options.margin + titleSize;
        var rootBox = (this.getRoot() || {}).box || box;
        var boxSize = rootBox[sizeFn]();
        var maxLabelSize = 0;

        for (var i = 0; i < count; i++) {
            var labelSize = labels[i].box[sizeFn]();
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
    };

    Axis.prototype.getLabelsTickPositions = function getLabelsTickPositions () {
        return this.getMajorTickPositions();
    };

    Axis.prototype.labelTickIndex = function labelTickIndex (label) {
        return label.index;
    };

    Axis.prototype.arrangeLabels = function arrangeLabels () {
        var this$1 = this;

        var ref = this;
        var options = ref.options;
        var labels = ref.labels;
        var labelsBetweenTicks = this.labelsBetweenTicks();
        var vertical = options.vertical;
        var lineBox = this.lineBox();
        var mirror = options.labels.mirror;
        var tickPositions = this.getLabelsTickPositions();
        var labelOffset = this.getActualTickSize() + options.margin;

        for (var idx = 0; idx < labels.length; idx++) {
            var label = labels[idx];
            var tickIx = this$1.labelTickIndex(label);
            var labelSize = vertical ? label.box.height() : label.box.width();
            var labelPos = tickPositions[tickIx] - (labelSize / 2);
            var labelBox = (void 0), firstTickPosition = (void 0), nextTickPosition = (void 0);

            if (vertical) {
                if (labelsBetweenTicks) {
                    firstTickPosition = tickPositions[tickIx];
                    nextTickPosition = tickPositions[tickIx + 1];

                    var middle = firstTickPosition + (nextTickPosition - firstTickPosition) / 2;
                    labelPos = middle - (labelSize / 2);
                }

                var labelX = lineBox.x2;

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

                var labelY = lineBox.y1;

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
    };

    Axis.prototype.autoRotateLabels = function autoRotateLabels () {
        if (this.options.autoRotateLabels && !this.options.vertical) {
            var tickPositions = this.getMajorTickPositions();
            var labels = this.labels;
            var angle;

            for (var idx = 0; idx < labels.length; idx++) {
                var width = Math.abs(tickPositions[idx + 1] - tickPositions[idx]);
                var labelBox = labels[idx].box;

                if (labelBox.width() > width) {
                    if (labelBox.height() > width) {
                        angle = -90;
                        break;
                    }
                    angle = -45;
                }
            }

            if (angle) {
                for (var idx$1 = 0; idx$1 < labels.length; idx$1++) {
                    labels[idx$1].options.rotation = angle;
                    labels[idx$1].reflow(new Box());
                }
                return true;
            }
        }
    };

    Axis.prototype.arrangeTitle = function arrangeTitle () {
        var ref = this;
        var options = ref.options;
        var title = ref.title;
        var mirror = options.labels.mirror;
        var vertical = options.vertical;

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
    };

    Axis.prototype.arrangeNotes = function arrangeNotes () {
        var this$1 = this;

        for (var idx = 0; idx < this.notes.length; idx++) {
            var item = this$1.notes[idx];
            var value = item.options.value;
            var slot = (void 0);

            if (defined(value)) {
                if (this$1.shouldRenderNote(value)) {
                    item.show();
                } else {
                    item.hide();
                }

                slot = this$1.noteSlot(value);
            } else {
                item.hide();
            }

            item.reflow(slot || this$1.lineBox());
        }
    };

    Axis.prototype.noteSlot = function noteSlot (value) {
        return this.getSlot(value);
    };

    Axis.prototype.alignTo = function alignTo (secondAxis) {
        var lineBox = secondAxis.lineBox();
        var vertical = this.options.vertical;
        var pos = vertical ? Y : X;

        this.box.snapTo(lineBox, pos);
        if (vertical) {
            this.box.shrink(0, this.lineBox().height() - lineBox.height());
        } else {
            this.box.shrink(this.lineBox().width() - lineBox.width(), 0);
        }
        this.box[pos + 1] -= this.lineBox()[pos + 1] - lineBox[pos + 1];
        this.box[pos + 2] -= this.lineBox()[pos + 2] - lineBox[pos + 2];
    };

    Axis.prototype.axisLabelText = function axisLabelText (value, dataItem, options) {
        var tmpl = getTemplate(options);
        var text = value;

        if (tmpl) {
            text = tmpl({ value: value, dataItem: dataItem, format: options.format, culture: options.culture });
        } else if (options.format) {
            text = this.chartService.format.localeAuto(options.format, [ value ], options.culture);
        }

        return text;
    };

    Axis.prototype.slot = function slot (from , to, limit) {
        var slot = this.getSlot(from, to, limit);
        if (slot) {
            return slot.toRect();
        }
    };

    Axis.prototype.contentBox = function contentBox () {
        var box = this.box.clone();
        var labels = this.labels;
        if (labels.length) {
            var axis = this.options.vertical ? Y : X;
            if (this.chartService.isPannable(axis)) {
                var offset = this.maxLabelOffset();
                box[axis + 1] -= offset.start;
                box[axis + 2] += offset.end;
            } else {
                if (labels[0].options.visible) {
                    box.wrap(labels[0].box);
                }
                var lastLabel = labels[labels.length - 1];
                if (lastLabel.options.visible) {
                    box.wrap(lastLabel.box);
                }
            }
        }

        return box;
    };

    Axis.prototype.maxLabelOffset = function maxLabelOffset () {
        var this$1 = this;

        var ref = this.options;
        var vertical = ref.vertical;
        var reverse = ref.reverse;
        var labelsBetweenTicks = this.labelsBetweenTicks();
        var tickPositions = this.getLabelsTickPositions();
        var offsetField = vertical ? Y : X;
        var labels = this.labels;
        var startPosition = reverse ? 1 : 0;
        var endPosition = reverse ? 0 : 1;
        var maxStartOffset = 0;
        var maxEndOffset = 0;

        for (var idx = 0; idx < labels.length; idx++) {
            var label = labels[idx];
            var tickIx = this$1.labelTickIndex(label);
            var startTick = (void 0), endTick = (void 0);

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
    };

    Axis.prototype.limitRange = function limitRange (from, to, min, max, offset) {
        var options = this.options;

        if ((from < min && offset < 0 && (!defined(options.min) || options.min <= min)) || (max < to && offset > 0 && (!defined(options.max) || max <= options.max))) {
            return null;
        }

        if ((to < min && offset > 0) || (max < from && offset < 0)) {
            return {
                min: from,
                max: to
            };
        }

        var rangeSize = to - from;
        var minValue = from;
        var maxValue = to;

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
    };

    Axis.prototype.valueRange = function valueRange () {
        return {
            min: this.seriesMin,
            max: this.seriesMax
        };
    };

    Axis.prototype.labelsBetweenTicks = function labelsBetweenTicks () {
        return !this.options.justified;
    };

    //add legacy fields to the options that are no longer generated by default
    Axis.prototype.prepareUserOptions = function prepareUserOptions () {
    };

    return Axis;
}(ChartElement));

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
