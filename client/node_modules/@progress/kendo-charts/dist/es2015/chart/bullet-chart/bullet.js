import { drawing as draw } from '@progress/kendo-drawing';

import Target from './target';

import { ChartElement, Box } from '../../core';

import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';
import Bar from '../bar-chart/bar';

import { WHITE, TOP, RIGHT } from '../../common/constants';
import { alignPathToPixel, deepExtend, defined, setDefaultOptions, valueOrDefault } from '../../common';

class Bullet extends ChartElement {
    constructor(value, options) {
        super(options);

        this.aboveAxis = this.options.aboveAxis;
        this.color = options.color || WHITE;
        this.value = value;
    }

    render() {
        const options = this.options;

        if (!this._rendered) {
            this._rendered = true;

            if (defined(this.value.target)) {
                this.target = new Target({
                    type: options.target.shape,
                    background: options.target.color || this.color,
                    opacity: options.opacity,
                    zIndex: options.zIndex,
                    border: options.target.border,
                    vAlign: TOP,
                    align: RIGHT
                });

                this.target.value = this.value;
                this.target.dataItem = this.dataItem;
                this.target.series = this.series;

                this.append(this.target);
            }

            this.createNote();
        }
    }

    reflow(box) {
        this.render();

        const { options, target, owner: chart } = this;
        const invertAxes = options.invertAxes;
        const valueAxis = chart.seriesValueAxis(this.options);
        const categorySlot = chart.categorySlot(chart.categoryAxis, options.categoryIx, valueAxis);
        const targetValueSlot = valueAxis.getSlot(this.value.target);
        const targetSlotX = invertAxes ? targetValueSlot : categorySlot;
        const targetSlotY = invertAxes ? categorySlot : targetValueSlot;

        if (target) {
            const targetSlot = new Box(
                targetSlotX.x1, targetSlotY.y1,
                targetSlotX.x2, targetSlotY.y2
            );
            target.options.height = invertAxes ? targetSlot.height() : options.target.line.width;
            target.options.width = invertAxes ? options.target.line.width : targetSlot.width();
            target.reflow(targetSlot);
        }

        if (this.note) {
            this.note.reflow(box);
        }

        this.box = box;
    }

    createVisual() {
        super.createVisual();

        const options = this.options;
        const body = draw.Path.fromRect(this.box.toRect(), {
            fill: {
                color: this.color,
                opacity: options.opacity
            },
            stroke: null
        });

        if (options.border.width > 0) {
            body.options.set("stroke", {
                color: options.border.color || this.color,
                width: options.border.width,
                dashType: options.border.dashType,
                opacity: valueOrDefault(options.border.opacity, options.opacity)
            });
        }

        this.bodyVisual = body;

        alignPathToPixel(body);
        this.visual.append(body);
    }

    createAnimation() {
        if (this.bodyVisual) {
            this.animation = draw.Animation.create(
                this.bodyVisual, this.options.animation
            );
        }
    }

    createHighlight(style) {
        return draw.Path.fromRect(this.box.toRect(), style);
    }

    highlightVisual() {
        return this.bodyVisual;
    }

    highlightVisualArgs() {
        return {
            rect: this.box.toRect(),
            visual: this.bodyVisual,
            options: this.options
        };
    }

    formatValue(format) {
        return this.owner.formatPointValue(this, format);
    }
}

Bullet.prototype.tooltipAnchor = Bar.prototype.tooltipAnchor;

setDefaultOptions(Bullet, {
    border: {
        width: 1
    },
    vertical: false,
    opacity: 1,
    target: {
        shape: "",
        border: {
            width: 0,
            color: "green"
        },
        line: {
            width: 2
        }
    },
    tooltip: {
        format: "Current: {0}<br />Target: {1}"
    }
});

deepExtend(Bullet.prototype, PointEventsMixin);
deepExtend(Bullet.prototype, NoteMixin);

export default Bullet;