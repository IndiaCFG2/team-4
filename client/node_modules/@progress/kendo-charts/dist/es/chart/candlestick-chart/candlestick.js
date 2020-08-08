import { drawing as draw, Color } from '@progress/kendo-drawing';

import { ChartElement, Point } from '../../core';
import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';

import { TOOLTIP_OFFSET } from '../constants';
import hasGradientOverlay from '../utils/has-gradient-overlay';

import { WHITE, LEFT, TOP } from '../../common/constants';
import { alignPathToPixel, deepExtend, defined, setDefaultOptions, valueOrDefault } from '../../common';

var Candlestick = (function (ChartElement) {
    function Candlestick(value, options) {
        ChartElement.call(this, options);
        this.value = value;
    }

    if ( ChartElement ) Candlestick.__proto__ = ChartElement;
    Candlestick.prototype = Object.create( ChartElement && ChartElement.prototype );
    Candlestick.prototype.constructor = Candlestick;

    Candlestick.prototype.reflow = function reflow (box) {
        var ref = this;
        var options = ref.options;
        var value = ref.value;
        var chart = ref.owner;
        var valueAxis = chart.seriesValueAxis(options);
        var ocSlot = valueAxis.getSlot(value.open, value.close);
        var lhSlot = valueAxis.getSlot(value.low, value.high);

        ocSlot.x1 = lhSlot.x1 = box.x1;
        ocSlot.x2 = lhSlot.x2 = box.x2;

        this.realBody = ocSlot;

        var mid = lhSlot.center().x;
        var points = [];

        points.push([ [ mid, lhSlot.y1 ], [ mid, ocSlot.y1 ] ]);
        points.push([ [ mid, ocSlot.y2 ], [ mid, lhSlot.y2 ] ]);

        this.lines = points;

        this.box = lhSlot.clone().wrap(ocSlot);

        if (!this._rendered) {
            this._rendered = true;
            this.createNote();
        }

        this.reflowNote();
    };

    Candlestick.prototype.reflowNote = function reflowNote () {
        if (this.note) {
            this.note.reflow(this.box);
        }
    };

    Candlestick.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);
        this._mainVisual = this.mainVisual(this.options);
        this.visual.append(
            this._mainVisual
        );

        this.createOverlay();
    };

    Candlestick.prototype.mainVisual = function mainVisual (options) {
        var group = new draw.Group();

        this.createBody(group, options);
        this.createLines(group, options);

        return group;
    };

    Candlestick.prototype.createBody = function createBody (container, options) {
        var body = draw.Path.fromRect(this.realBody.toRect(), {
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
    };

    Candlestick.prototype.createLines = function createLines (container, options) {
        this.drawLines(container, options, this.lines, options.line);
    };

    Candlestick.prototype.drawLines = function drawLines (container, options, lines, lineOptions) {
        if (!lines) {
            return;
        }

        var lineStyle = {
            stroke: {
                color: lineOptions.color || this.color,
                opacity: valueOrDefault(lineOptions.opacity, options.opacity),
                width: lineOptions.width,
                dashType: lineOptions.dashType,
                lineCap: "butt"
            }
        };

        for (var i = 0; i < lines.length; i++) {
            var line = draw.Path.fromPoints(lines[i], lineStyle);
            alignPathToPixel(line);
            container.append(line);
        }
    };

    Candlestick.prototype.getBorderColor = function getBorderColor () {
        var border = this.options.border;
        var borderColor = border.color;

        if (!defined(borderColor)) {
            borderColor = new Color(this.color).brightness(border._brightness).toHex();
        }

        return borderColor;
    };

    Candlestick.prototype.createOverlay = function createOverlay () {
        var overlay = draw.Path.fromRect(this.box.toRect(), {
            fill: {
                color: WHITE,
                opacity: 0
            },
            stroke: null
        });

        this.visual.append(overlay);
    };

    Candlestick.prototype.createHighlight = function createHighlight () {
        var highlight = this.options.highlight;
        var normalColor = this.color;

        this.color = highlight.color || this.color;
        var overlay = this.mainVisual(
            deepExtend({}, this.options, {
                line: {
                    color: this.getBorderColor()
                }
            }, highlight)
        );
        this.color = normalColor;

        return overlay;
    };

    Candlestick.prototype.highlightVisual = function highlightVisual () {
        return this._mainVisual;
    };

    Candlestick.prototype.highlightVisualArgs = function highlightVisualArgs () {
        return {
            options: this.options,
            rect: this.box.toRect(),
            visual: this._mainVisual
        };
    };

    Candlestick.prototype.tooltipAnchor = function tooltipAnchor () {
        var box = this.box;
        var clipBox = this.owner.pane.clipBox() || box;

        return {
            point: new Point(box.x2 + TOOLTIP_OFFSET, Math.max(box.y1, clipBox.y1) + TOOLTIP_OFFSET),
            align: {
                horizontal: LEFT,
                vertical: TOP
            }
        };
    };

    Candlestick.prototype.formatValue = function formatValue (format) {
        return this.owner.formatPointValue(this, format);
    };

    Candlestick.prototype.overlapsBox = function overlapsBox (box) {
        return this.box.overlaps(box);
    };

    return Candlestick;
}(ChartElement));

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