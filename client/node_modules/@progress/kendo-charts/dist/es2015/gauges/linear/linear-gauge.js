import { drawing } from '@progress/kendo-drawing';
import { Box } from '../../core';
import { setDefaultOptions, deepExtend, isArray } from '../../common';
import { ARROW, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../constants';
import Gauge from '../gauge';
import LinearScale from './linear-scale';
import ArrowLinearPointer from './arrow-linear-pointer';
import BarLinearPointer from './bar-linear-pointer';

const DEFAULT_MIN_WIDTH = 60;
const DEFAULT_MIN_HEIGHT = 60;

const Group = drawing.Group;

class LinearGauge extends Gauge {

    reflow(bbox) {
        const pointers = this.pointers;
        const bboxX = bbox.origin.x;
        const bboxY = bbox.origin.y;

        const box = new Box(bboxX, bboxY, bboxX + bbox.width(), bboxY + bbox.height());

        this.scale.reflow(box);
        this._shrinkScaleWidth(box);

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow();
        }

        this.bbox = this._getBox(box);
        this._alignElements();
        this._shrinkElements();
        this._buildVisual();
        this._draw();
    }

    _buildVisual() {
        const visuals = new Group();
        const scaleElements = this.scale.render();
        const pointers = this.pointers;

        visuals.append(this.gaugeArea);
        visuals.append(scaleElements);

        for (let i = 0; i < pointers.length; i++) {
            const current = pointers[i];
            visuals.append(current.render());
            current.value(current.options.value);
        }

        this._visuals = visuals;
    }

    _createModel() {
        const options = this.options;
        const scale = this.scale = new LinearScale(options.scale, this.contextService);

        this.pointers = [];

        let pointers = options.pointer;
        pointers = isArray(pointers) ? pointers : [ pointers ];

        for (let i = 0; i < pointers.length; i++) {
            const currentOptions = deepExtend({}, pointers[i], {
                animation: {
                    transitions: options.transitions
                }
            });
            const pointerType = currentOptions.shape === ARROW ? ArrowLinearPointer : BarLinearPointer;

            this.pointers.push(new pointerType(scale, currentOptions));
        }
    }

    _defaultSize() {
        const vertical = this.options.scale.vertical;

        return {
            width: vertical ? DEFAULT_MIN_WIDTH : DEFAULT_WIDTH,
            height: vertical ? DEFAULT_HEIGHT : DEFAULT_MIN_HEIGHT
        };
    }

    _getBox(box) {
        const { scale, pointers } = this;
        const boxCenter = box.center();
        let plotAreaBox = pointers[0].box.clone().wrap(scale.box);

        for (let i = 0; i < pointers.length; i++) {
            plotAreaBox.wrap(pointers[i].box.clone());
        }

        let size;
        if (scale.options.vertical) {
            size = plotAreaBox.width() / 2;
            plotAreaBox = new Box(
                boxCenter.x - size, box.y1,
                boxCenter.x + size, box.y2
            );
        } else {
            size = plotAreaBox.height() / 2;
            plotAreaBox = new Box(
                box.x1, boxCenter.y - size,
                box.x2, boxCenter.y + size
            );
        }

        return plotAreaBox;
    }

    _alignElements() {
        const { scale, pointers } = this;
        const scaleBox = scale.box;
        const box = pointers[0].box.clone().wrap(scale.box);
        const plotAreaBox = this.bbox;

        for (let i = 0; i < pointers.length; i++) {
            box.wrap(pointers[i].box.clone());
        }

        let diff;
        if (scale.options.vertical) {
            diff = plotAreaBox.center().x - box.center().x;
            scale.reflow(new Box(
                scaleBox.x1 + diff, plotAreaBox.y1,
                scaleBox.x2 + diff, plotAreaBox.y2
            ));
        } else {
            diff = plotAreaBox.center().y - box.center().y;
            scale.reflow(new Box(
                scaleBox.x1, scaleBox.y1 + diff,
                scaleBox.x2, scaleBox.y2 + diff
            ));
        }

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow(this.bbox);
        }
    }

    _shrinkScaleWidth(bbox) {
        const { scale } = this;
        if (!scale.options.vertical) {
            const overflow = scale.contentBox().width() - bbox.width();
            if (overflow > 0) {
                scale.box.shrink(overflow, 0);
                scale.box.alignTo(bbox, 'center');
                scale.reflow(scale.box);
            }
        }
    }

    _shrinkElements() {
        const { scale, pointers } = this;
        const scaleBox = scale.box.clone();
        const pos = scale.options.vertical ? "y" : "x";
        const pointerBox = pointers[0].box;

        for (let i = 0; i < pointers.length; i++) {
            pointerBox.wrap(pointers[i].box.clone());
        }

        scaleBox[pos + 1] += Math.max(scaleBox[pos + 1] - pointerBox[pos + 1], 0);
        scaleBox[pos + 2] -= Math.max(pointerBox[pos + 2] - scaleBox[pos + 2], 0);

        scale.reflow(scaleBox);

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow(this.bbox);
        }
    }
}

setDefaultOptions(LinearGauge, {
    transitions: true,
    gaugeArea: {
        background: ""
    },
    scale: {
        vertical: true
    }
});

export default LinearGauge;