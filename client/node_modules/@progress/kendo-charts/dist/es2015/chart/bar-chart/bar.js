import { drawing as draw, Color } from '@progress/kendo-drawing';

import BarLabel from './bar-label';

import { BORDER_BRIGHTNESS, TOOLTIP_OFFSET } from '../constants';

import hasGradientOverlay from '../utils/has-gradient-overlay';

import { ChartElement, Point } from '../../core';

import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';

import { WHITE, LEFT, RIGHT, BOTTOM, TOP } from '../../common/constants';
import { alignPathToPixel, deepExtend, defined, getTemplate, valueOrDefault } from '../../common';

const BAR_ALIGN_MIN_WIDTH = 6;

class Bar extends ChartElement {
    constructor(value, options) {
        super();

        this.options = options;
        this.color = options.color || WHITE;
        this.aboveAxis = valueOrDefault(this.options.aboveAxis, true);
        this.value = value;
    }

    render() {
        if (this._rendered) {
            return;
        }

        this._rendered = true;

        this.createLabel();
        this.createNote();

        if (this.errorBar) {
            this.append(this.errorBar);
        }
    }

    createLabel() {
        const options = this.options;
        const labels = options.labels;

        if (labels.visible) {
            const pointData = this.pointData();
            let labelTemplate = getTemplate(labels);
            let labelText;

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
    }

    formatValue(format) {
        return this.owner.formatPointValue(this, format);
    }

    reflow(targetBox) {
        this.render();

        const label = this.label;

        this.box = targetBox;

        if (label) {
            label.options.aboveAxis = this.aboveAxis;
            label.reflow(targetBox);
        }

        if (this.note) {
            this.note.reflow(targetBox);
        }

        if (this.errorBars) {
            for (let i = 0; i < this.errorBars.length; i++) {
                this.errorBars[i].reflow(targetBox);
            }
        }
    }

    createVisual() {
        const { box, options } = this;
        const customVisual = options.visual;

        if (this.visible !== false) {
            super.createVisual();

            if (customVisual) {
                const visual = this.rectVisual = customVisual({
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
                    createVisual: () => {
                        const group = new draw.Group();
                        this.createRect(group);
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
    }

    createRect(visual) {
        const options = this.options;
        const border = options.border;
        const strokeOpacity = defined(border.opacity) ? border.opacity : options.opacity;
        const rect = this.box.toRect();

        rect.size.width = Math.round(rect.size.width);

        const path = this.rectVisual = draw.Path.fromRect(rect, {
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

        const width = this.box.width();
        const height = this.box.height();

        const size = options.vertical ? width : height;

        if (size > BAR_ALIGN_MIN_WIDTH) {
            alignPathToPixel(path);

            // Fixes lineJoin issue in firefox when the joined lines are parallel
            if (width < 1 || height < 1) {
                path.options.stroke.lineJoin = "round";
            }
        }

        visual.append(path);

        if (hasGradientOverlay(options)) {
            const overlay = this.createGradientOverlay(path, { baseColor: this.color }, deepExtend({
                end: !options.vertical ? [ 0, 1 ] : undefined
            }, options.overlay));

            visual.append(overlay);
        }
    }

    createHighlight(style) {
        const highlight = draw.Path.fromRect(this.box.toRect(), style);

        return alignPathToPixel(highlight);
    }

    highlightVisual() {
        return this.rectVisual;
    }

    highlightVisualArgs() {
        return {
            options: this.options,
            rect: this.box.toRect(),
            visual: this.rectVisual
        };
    }

    getBorderColor() {
        const color = this.color;
        const border = this.options.border;
        const brightness = border._brightness || BORDER_BRIGHTNESS;
        let borderColor = border.color;

        if (!defined(borderColor)) {
            borderColor = new Color(color).brightness(brightness).toHex();
        }

        return borderColor;
    }

    tooltipAnchor() {
        const { options, box, aboveAxis } = this;
        const clipBox = this.owner.pane.clipBox() || box;
        let horizontalAlign = LEFT;
        let verticalAlign = TOP;
        let x, y;

        if (options.vertical) {
            x = Math.min(box.x2, clipBox.x2) + TOOLTIP_OFFSET;
            if (aboveAxis) {
                y = Math.max(box.y1, clipBox.y1);
            } else {
                y = Math.min(box.y2, clipBox.y2);
                verticalAlign = BOTTOM;
            }
        } else {
            const x1 = Math.max(box.x1, clipBox.x1);
            const x2 = Math.min(box.x2, clipBox.x2);

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
    }

    overlapsBox(box) {
        return this.box.overlaps(box);
    }

    pointData() {
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
    }
}

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