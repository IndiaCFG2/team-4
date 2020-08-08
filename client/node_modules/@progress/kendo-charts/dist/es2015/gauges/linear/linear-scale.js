import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { setDefaultOptions, deepExtend, defined } from '../../common';
import { BLACK } from '../../common/constants';
import { NumericAxis } from '../../core';
import { DEFAULT_LINE_WIDTH, INSIDE } from '../constants';
import { autoMajorUnit } from '../../core';
import { buildLabelElement, getRange } from '../utils';

const { Path, Group } = drawing;
const Point = geo.Point;

function renderAxisTick(tickRenderOptions, tickOptions) {
    const { position, tickX, tickY } = tickRenderOptions;
    let start, end;

    if (tickRenderOptions.vertical) {
        start = new Point(tickX, position);
        end = new Point(tickX + tickOptions.size, position);
    } else {
        start = new Point(position, tickY);
        end = new Point(position, tickY + tickOptions.size);
    }

    const tickPath = new Path({
        stroke: {
            color: tickOptions.color,
            width: tickOptions.width
        }
    }).moveTo(start).lineTo(end);

    return tickPath;
}

function renderTicks(tickGroup, tickPositions, tickRenderOptions, tickOptions) {
    const count = tickPositions.length;

    if (tickOptions.visible) {
        const { mirror, lineBox } = tickRenderOptions;
        for (let i = tickOptions.skip; i < count; i += tickOptions.step) {
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

class LinearScale extends NumericAxis {
    constructor(options, service) {
        let scaleOptions = options || {};
        if (!defined(scaleOptions.reverse) && scaleOptions.vertical === false && (service || {}).rtl) {
            scaleOptions = Object.assign({}, scaleOptions, {
                reverse: true
            });
        }

        super(0, 1, scaleOptions, service);

        this.options.minorUnit = this.options.minorUnit || this.options.majorUnit / 10;
    }

    initUserOptions(options) {
        let scaleOptions = deepExtend({}, this.options, options);
        scaleOptions = deepExtend({}, scaleOptions , { labels: { mirror: scaleOptions.mirror } });
        scaleOptions.majorUnit = scaleOptions.majorUnit || autoMajorUnit(scaleOptions.min, scaleOptions.max);

        return scaleOptions;
    }

    initFields() {
    }

    render() {
        const elements = this.elements = new Group();
        const labels = this.renderLabels();
        const scaleLine = this.renderLine();
        const scaleTicks = this.renderTicks();
        const ranges = this.renderRanges();

        elements.append(scaleLine, labels, scaleTicks, ranges);

        return elements;
    }

    renderRanges() {
        const options = this.options;
        const { min, max, vertical, labels: { mirror } } = options;
        const ranges = options.ranges || [];
        const elements = new Group();
        const count = ranges.length;
        const rangeSize = options.rangeSize || options.minorTicks.size / 2;

        for (let i = 0; i < count; i++) {
            const range = getRange(ranges[i], min, max);
            const slot = this.getSlot(range.from, range.to);
            const slotX = vertical ? this.lineBox() : slot;
            const slotY = vertical ? slot : this.lineBox();
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
    }

    renderLabels() {
        const { labels, options } = this;
        const elements = new Group();

        for (let i = 0; i < labels.length; i++) {
            elements.append(buildLabelElement(labels[i], options.labels));
        }

        return elements;
    }

    renderLine() {
        const line = this.options.line;
        const lineBox = this.lineBox();
        const elements = new Group();

        if (line.width > 0 && line.visible) {
            const linePath = new Path({
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
    }

    renderTicks() {
        const ticks = new Group();
        const options = this.options;
        const majorUnit = options.majorTicks.visible ? options.majorUnit : 0;
        const tickRenderOptions = {
            vertical: options.vertical,
            mirror: options.labels.mirror,
            lineBox: this.lineBox()
        };

        renderTicks(ticks, this.getMajorTickPositions(), tickRenderOptions, options.majorTicks);
        renderTicks(ticks, this.getMinorTickPositions(), tickRenderOptions, deepExtend({}, {
            skipUnit: majorUnit / options.minorUnit
        }, options.minorTicks));

        return ticks;
    }
}

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