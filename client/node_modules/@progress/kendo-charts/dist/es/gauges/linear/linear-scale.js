import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { setDefaultOptions, deepExtend, defined } from '../../common';
import { BLACK } from '../../common/constants';
import { NumericAxis } from '../../core';
import { DEFAULT_LINE_WIDTH, INSIDE } from '../constants';
import { autoMajorUnit } from '../../core';
import { buildLabelElement, getRange } from '../utils';

var Path = drawing.Path;
var Group = drawing.Group;
var Point = geo.Point;

function renderAxisTick(tickRenderOptions, tickOptions) {
    var position = tickRenderOptions.position;
    var tickX = tickRenderOptions.tickX;
    var tickY = tickRenderOptions.tickY;
    var start, end;

    if (tickRenderOptions.vertical) {
        start = new Point(tickX, position);
        end = new Point(tickX + tickOptions.size, position);
    } else {
        start = new Point(position, tickY);
        end = new Point(position, tickY + tickOptions.size);
    }

    var tickPath = new Path({
        stroke: {
            color: tickOptions.color,
            width: tickOptions.width
        }
    }).moveTo(start).lineTo(end);

    return tickPath;
}

function renderTicks(tickGroup, tickPositions, tickRenderOptions, tickOptions) {
    var count = tickPositions.length;

    if (tickOptions.visible) {
        var mirror = tickRenderOptions.mirror;
        var lineBox = tickRenderOptions.lineBox;
        for (var i = tickOptions.skip; i < count; i += tickOptions.step) {
            if (i % tickOptions.skipUnit === 0) {
                continue;
            }

            tickRenderOptions.tickX = mirror ? lineBox.x2 : lineBox.x2 - tickOptions.size;
            tickRenderOptions.tickY = mirror ? lineBox.y1 - tickOptions.size : lineBox.y1;
            tickRenderOptions.position = tickPositions[i];

            tickGroup.append(renderAxisTick(tickRenderOptions, tickOptions));
        }
    }
}

var LinearScale = (function (NumericAxis) {
    function LinearScale(options, service) {
        var scaleOptions = options || {};
        if (!defined(scaleOptions.reverse) && scaleOptions.vertical === false && (service || {}).rtl) {
            scaleOptions = Object.assign({}, scaleOptions, {
                reverse: true
            });
        }

        NumericAxis.call(this, 0, 1, scaleOptions, service);

        this.options.minorUnit = this.options.minorUnit || this.options.majorUnit / 10;
    }

    if ( NumericAxis ) LinearScale.__proto__ = NumericAxis;
    LinearScale.prototype = Object.create( NumericAxis && NumericAxis.prototype );
    LinearScale.prototype.constructor = LinearScale;

    LinearScale.prototype.initUserOptions = function initUserOptions (options) {
        var scaleOptions = deepExtend({}, this.options, options);
        scaleOptions = deepExtend({}, scaleOptions , { labels: { mirror: scaleOptions.mirror } });
        scaleOptions.majorUnit = scaleOptions.majorUnit || autoMajorUnit(scaleOptions.min, scaleOptions.max);

        return scaleOptions;
    };

    LinearScale.prototype.initFields = function initFields () {
    };

    LinearScale.prototype.render = function render () {
        var elements = this.elements = new Group();
        var labels = this.renderLabels();
        var scaleLine = this.renderLine();
        var scaleTicks = this.renderTicks();
        var ranges = this.renderRanges();

        elements.append(scaleLine, labels, scaleTicks, ranges);

        return elements;
    };

    LinearScale.prototype.renderRanges = function renderRanges () {
        var this$1 = this;

        var options = this.options;
        var min = options.min;
        var max = options.max;
        var vertical = options.vertical;
        var mirror = options.labels.mirror;
        var ranges = options.ranges || [];
        var elements = new Group();
        var count = ranges.length;
        var rangeSize = options.rangeSize || options.minorTicks.size / 2;

        for (var i = 0; i < count; i++) {
            var range = getRange(ranges[i], min, max);
            var slot = this$1.getSlot(range.from, range.to);
            var slotX = vertical ? this$1.lineBox() : slot;
            var slotY = vertical ? slot : this$1.lineBox();
            if (vertical) {
                slotX.x1 -= rangeSize * (mirror ? -1 : 1);
            } else {
                slotY.y2 += rangeSize * (mirror ? -1 : 1);
            }

            elements.append(Path.fromRect(new geo.Rect([ slotX.x1, slotY.y1 ], [ slotX.x2 - slotX.x1, slotY.y2 - slotY.y1 ]), {
                fill: { color: range.color, opacity: range.opacity },
                stroke: { }
            }));
        }

        return elements;
    };

    LinearScale.prototype.renderLabels = function renderLabels () {
        var ref = this;
        var labels = ref.labels;
        var options = ref.options;
        var elements = new Group();

        for (var i = 0; i < labels.length; i++) {
            elements.append(buildLabelElement(labels[i], options.labels));
        }

        return elements;
    };

    LinearScale.prototype.renderLine = function renderLine () {
        var line = this.options.line;
        var lineBox = this.lineBox();
        var elements = new Group();

        if (line.width > 0 && line.visible) {
            var linePath = new Path({
                stroke: {
                    color: line.color,
                    dashType: line.dashType,
                    width: line.width
                }
            });

            linePath.moveTo(lineBox.x1, lineBox.y1).lineTo(lineBox.x2, lineBox.y2);
            elements.append(linePath);
        }

        return elements;
    };

    LinearScale.prototype.renderTicks = function renderTicks$1 () {
        var ticks = new Group();
        var options = this.options;
        var majorUnit = options.majorTicks.visible ? options.majorUnit : 0;
        var tickRenderOptions = {
            vertical: options.vertical,
            mirror: options.labels.mirror,
            lineBox: this.lineBox()
        };

        renderTicks(ticks, this.getMajorTickPositions(), tickRenderOptions, options.majorTicks);
        renderTicks(ticks, this.getMinorTickPositions(), tickRenderOptions, deepExtend({}, {
            skipUnit: majorUnit / options.minorUnit
        }, options.minorTicks));

        return ticks;
    };

    return LinearScale;
}(NumericAxis));

setDefaultOptions(LinearScale, {
    min: 0,
    max: 50,

    majorTicks: {
        size: 15,
        align: INSIDE,
        color: BLACK,
        width: DEFAULT_LINE_WIDTH,
        visible: true
    },

    minorTicks: {
        size: 10,
        align: INSIDE,
        color: BLACK,
        width: DEFAULT_LINE_WIDTH,
        visible: true
    },

    line: {
        width: DEFAULT_LINE_WIDTH
    },

    labels: {
        position: INSIDE,
        padding: 2
    },
    mirror: false,
    _alignLines: false
});

export default LinearScale;