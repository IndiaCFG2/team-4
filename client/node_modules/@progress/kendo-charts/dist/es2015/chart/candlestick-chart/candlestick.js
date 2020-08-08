import { drawing as draw, Color } from '@progress/kendo-drawing';

import { ChartElement, Point } from '../../core';
import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';

import { TOOLTIP_OFFSET } from '../constants';
import hasGradientOverlay from '../utils/has-gradient-overlay';

import { WHITE, LEFT, TOP } from '../../common/constants';
import { alignPathToPixel, deepExtend, defined, setDefaultOptions, valueOrDefault } from '../../common';

class Candlestick extends ChartElement {
    constructor(value, options) {
        super(options);
        this.value = value;
    }

    reflow(box) {
        const { options, value, owner: chart } = this;
        const valueAxis = chart.seriesValueAxis(options);
        const ocSlot = valueAxis.getSlot(value.open, value.close);
        const lhSlot = valueAxis.getSlot(value.low, value.high);

        ocSlot.x1 = lhSlot.x1 = box.x1;
        ocSlot.x2 = lhSlot.x2 = box.x2;

        this.realBody = ocSlot;

        const mid = lhSlot.center().x;
        const points = [];

        points.push([ [ mid, lhSlot.y1 ], [ mid, ocSlot.y1 ] ]);
        points.push([ [ mid, ocSlot.y2 ], [ mid, lhSlot.y2 ] ]);

        this.lines = points;

        this.box = lhSlot.clone().wrap(ocSlot);

        if (!this._rendered) {
            this._rendered = true;
            this.createNote();
        }

        this.reflowNote();
    }

    reflowNote() {
        if (this.note) {
            this.note.reflow(this.box);
        }
    }

    createVisual() {
        super.createVisual();
        this._mainVisual = this.mainVisual(this.options);
        this.visual.append(
            this._mainVisual
        );

        this.createOverlay();
    }

    mainVisual(options) {
        const group = new draw.Group();

        this.createBody(group, options);
        this.createLines(group, options);

        return group;
    }

    createBody(container, options) {
        const body = draw.Path.fromRect(this.realBody.toRect(), {
            fill: {
                color: this.color,
                opacity: options.opacity
            },
            stroke: null
        });

        if (options.border.width > 0) {
            body.options.set("stroke", {
                color: this.getBorderColor(),
                width: options.border.width,
                dashType: options.border.dashType,
                opacity: valueOrDefault(options.border.opacity, options.opacity)
            });
        }

        alignPathToPixel(body);
        container.append(body);

        if (hasGradientOverlay(options)) {
            container.append(this.createGradientOverlay(body, { baseColor: this.color }, deepExtend({
                end: !options.vertical ? [ 0, 1 ] : undefined
            }, options.overlay)));
        }
    }

    createLines(container, options) {
        this.drawLines(container, options, this.lines, options.line);
    }

    drawLines(container, options, lines, lineOptions) {
        if (!lines) {
            return;
        }

        const lineStyle = {
            stroke: {
                color: lineOptions.color || this.color,
                opacity: valueOrDefault(lineOptions.opacity, options.opacity),
                width: lineOptions.width,
                dashType: lineOptions.dashType,
                lineCap: "butt"
            }
        };

        for (let i = 0; i < lines.length; i++) {
            const line = draw.Path.fromPoints(lines[i], lineStyle);
            alignPathToPixel(line);
            container.append(line);
        }
    }

    getBorderColor() {
        const border = this.options.border;
        let borderColor = border.color;

        if (!defined(borderColor)) {
            borderColor = new Color(this.color).brightness(border._brightness).toHex();
        }

        return borderColor;
    }

    createOverlay() {
        const overlay = draw.Path.fromRect(this.box.toRect(), {
            fill: {
                color: WHITE,
                opacity: 0
            },
            stroke: null
        });

        this.visual.append(overlay);
    }

    createHighlight() {
        const highlight = this.options.highlight;
        const normalColor = this.color;

        this.color = highlight.color || this.color;
        const overlay = this.mainVisual(
            deepExtend({}, this.options, {
                line: {
                    color: this.getBorderColor()
                }
            }, highlight)
        );
        this.color = normalColor;

        return overlay;
    }

    highlightVisual() {
        return this._mainVisual;
    }

    highlightVisualArgs() {
        return {
            options: this.options,
            rect: this.box.toRect(),
            visual: this._mainVisual
        };
    }

    tooltipAnchor() {
        const box = this.box;
        const clipBox = this.owner.pane.clipBox() || box;

        return {
            point: new Point(box.x2 + TOOLTIP_OFFSET, Math.max(box.y1, clipBox.y1) + TOOLTIP_OFFSET),
            align: {
                horizontal: LEFT,
                vertical: TOP
            }
        };
    }

    formatValue(format) {
        return this.owner.formatPointValue(this, format);
    }

    overlapsBox(box) {
        return this.box.overlaps(box);
    }
}

setDefaultOptions(Candlestick, {
    vertical: true,
    border: {
        _brightness: 0.8
    },
    line: {
        width: 2
    },
    overlay: {
        gradient: "glass"
    },
    tooltip: {
        format: "<table>" +
                    "<tr><th colspan='2'>{4:d}</th></tr>" +
                    "<tr><td>Open:</td><td>{0:C}</td></tr>" +
                    "<tr><td>High:</td><td>{1:C}</td></tr>" +
                    "<tr><td>Low:</td><td>{2:C}</td></tr>" +
                    "<tr><td>Close:</td><td>{3:C}</td></tr>" +
                "</table>"
    },
    highlight: {
        opacity: 1,
        border: {
            width: 1,
            opacity: 1
        },
        line: {
            width: 1,
            opacity: 1
        }
    },
    notes: {
        visible: true,
        label: {}
    }
});

deepExtend(Candlestick.prototype, PointEventsMixin);
deepExtend(Candlestick.prototype, NoteMixin);

export default Candlestick;