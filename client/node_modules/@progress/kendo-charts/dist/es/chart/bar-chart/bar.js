import { drawing as draw, Color } from '@progress/kendo-drawing';

import BarLabel from './bar-label';

import { BORDER_BRIGHTNESS, TOOLTIP_OFFSET } from '../constants';

import hasGradientOverlay from '../utils/has-gradient-overlay';

import { ChartElement, Point } from '../../core';

import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';

import { WHITE, LEFT, RIGHT, BOTTOM, TOP } from '../../common/constants';
import { alignPathToPixel, deepExtend, defined, getTemplate, valueOrDefault } from '../../common';

var BAR_ALIGN_MIN_WIDTH = 6;

var Bar = (function (ChartElement) {
    function Bar(value, options) {
        ChartElement.call(this);

        this.options = options;
        this.color = options.color || WHITE;
        this.aboveAxis = valueOrDefault(this.options.aboveAxis, true);
        this.value = value;
    }

    if ( ChartElement ) Bar.__proto__ = ChartElement;
    Bar.prototype = Object.create( ChartElement && ChartElement.prototype );
    Bar.prototype.constructor = Bar;

    Bar.prototype.render = function render () {
        if (this._rendered) {
            return;
        }

        this._rendered = true;

        this.createLabel();
        this.createNote();

        if (this.errorBar) {
            this.append(this.errorBar);
        }
    };

    Bar.prototype.createLabel = function createLabel () {
        var options = this.options;
        var labels = options.labels;

        if (labels.visible) {
            var pointData = this.pointData();
            var labelTemplate = getTemplate(labels);
            var labelText;

            if (labelTemplate) {
                labelText = labelTemplate(pointData);
            } else {
                labelText = this.formatValue(labels.format);
            }

            this.label = new BarLabel(labelText,
                deepExtend({
                    vertical: options.vertical
                },
                labels
            ), pointData);
            this.append(this.label);
        }
    };

    Bar.prototype.formatValue = function formatValue (format) {
        return this.owner.formatPointValue(this, format);
    };

    Bar.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        this.render();

        var label = this.label;

        this.box = targetBox;

        if (label) {
            label.options.aboveAxis = this.aboveAxis;
            label.reflow(targetBox);
        }

        if (this.note) {
            this.note.reflow(targetBox);
        }

        if (this.errorBars) {
            for (var i = 0; i < this.errorBars.length; i++) {
                this$1.errorBars[i].reflow(targetBox);
            }
        }
    };

    Bar.prototype.createVisual = function createVisual () {
        var this$1 = this;

        var ref = this;
        var box = ref.box;
        var options = ref.options;
        var customVisual = options.visual;

        if (this.visible !== false) {
            ChartElement.prototype.createVisual.call(this);

            if (customVisual) {
                var visual = this.rectVisual = customVisual({
                    category: this.category,
                    dataItem: this.dataItem,
                    value: this.value,
                    sender: this.getSender(),
                    series: this.series,
                    percentage: this.percentage,
                    stackValue: this.stackValue,
                    runningTotal: this.runningTotal,
                    total: this.total,
                    rect: box.toRect(),
                    createVisual: function () {
                        var group = new draw.Group();
                        this$1.createRect(group);
                        return group;
                    },
                    options: options
                });

                if (visual) {
                    this.visual.append(visual);
                }
            } else if (box.width() > 0 && box.height() > 0) {
                this.createRect(this.visual);
            }
        }
    };

    Bar.prototype.createRect = function createRect (visual) {
        var options = this.options;
        var border = options.border;
        var strokeOpacity = defined(border.opacity) ? border.opacity : options.opacity;
        var rect = this.box.toRect();

        rect.size.width = Math.round(rect.size.width);

        var path = this.rectVisual = draw.Path.fromRect(rect, {
            fill: {
                color: this.color,
                opacity: options.opacity
            },
            stroke: {
                color: this.getBorderColor(),
                width: border.width,
                opacity: strokeOpacity,
                dashType: border.dashType
            }
        });

        var width = this.box.width();
        var height = this.box.height();

        var size = options.vertical ? width : height;

        if (size > BAR_ALIGN_MIN_WIDTH) {
            alignPathToPixel(path);

            // Fixes lineJoin issue in firefox when the joined lines are parallel
            if (width < 1 || height < 1) {
                path.options.stroke.lineJoin = "round";
            }
        }

        visual.append(path);

        if (hasGradientOverlay(options)) {
            var overlay = this.createGradientOverlay(path, { baseColor: this.color }, deepExtend({
                end: !options.vertical ? [ 0, 1 ] : undefined
            }, options.overlay));

            visual.append(overlay);
        }
    };

    Bar.prototype.createHighlight = function createHighlight (style) {
        var highlight = draw.Path.fromRect(this.box.toRect(), style);

        return alignPathToPixel(highlight);
    };

    Bar.prototype.highlightVisual = function highlightVisual () {
        return this.rectVisual;
    };

    Bar.prototype.highlightVisualArgs = function highlightVisualArgs () {
        return {
            options: this.options,
            rect: this.box.toRect(),
            visual: this.rectVisual
        };
    };

    Bar.prototype.getBorderColor = function getBorderColor () {
        var color = this.color;
        var border = this.options.border;
        var brightness = border._brightness || BORDER_BRIGHTNESS;
        var borderColor = border.color;

        if (!defined(borderColor)) {
            borderColor = new Color(color).brightness(brightness).toHex();
        }

        return borderColor;
    };

    Bar.prototype.tooltipAnchor = function tooltipAnchor () {
        var ref = this;
        var options = ref.options;
        var box = ref.box;
        var aboveAxis = ref.aboveAxis;
        var clipBox = this.owner.pane.clipBox() || box;
        var horizontalAlign = LEFT;
        var verticalAlign = TOP;
        var x, y;

        if (options.vertical) {
            x = Math.min(box.x2, clipBox.x2) + TOOLTIP_OFFSET;
            if (aboveAxis) {
                y = Math.max(box.y1, clipBox.y1);
            } else {
                y = Math.min(box.y2, clipBox.y2);
                verticalAlign = BOTTOM;
            }
        } else {
            var x1 = Math.max(box.x1, clipBox.x1);
            var x2 = Math.min(box.x2, clipBox.x2);

            if (options.isStacked) {
                verticalAlign = BOTTOM;
                if (aboveAxis) {
                    horizontalAlign = RIGHT;
                    x = x2;
                } else {
                    x = x1;
                }
                y = Math.max(box.y1, clipBox.y1) - TOOLTIP_OFFSET;
            } else {
                if (aboveAxis) {
                    x = x2 + TOOLTIP_OFFSET;
                } else {
                    x = x1 - TOOLTIP_OFFSET;
                    horizontalAlign = RIGHT;
                }
                y = Math.max(box.y1, clipBox.y1);
            }
        }

        return {
            point: new Point(x, y),
            align: {
                horizontal: horizontalAlign,
                vertical: verticalAlign
            }
        };
    };

    Bar.prototype.overlapsBox = function overlapsBox (box) {
        return this.box.overlaps(box);
    };

    Bar.prototype.pointData = function pointData () {
        return {
            dataItem: this.dataItem,
            category: this.category,
            value: this.value,
            percentage: this.percentage,
            stackValue: this.stackValue,
            runningTotal: this.runningTotal,
            total: this.total,
            series: this.series
        };
    };

    return Bar;
}(ChartElement));

deepExtend(Bar.prototype, PointEventsMixin);
deepExtend(Bar.prototype, NoteMixin);

Bar.prototype.defaults = {
    border: {
        width: 1
    },
    vertical: true,
    overlay: {
        gradient: "glass"
    },
    labels: {
        visible: false,
        format: "{0}"
    },
    opacity: 1,
    notes: {
        label: {}
    }
};

export default Bar;