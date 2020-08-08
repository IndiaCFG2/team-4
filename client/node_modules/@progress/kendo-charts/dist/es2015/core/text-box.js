import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import BoxElement from './box-element';
import FloatElement from './float-element';
import Text from './text';
import Box from './box';

import rectToBox from './utils/rect-to-box';

import { getSpacing, deepExtend, defined } from '../common';
import { X, Y } from '../common/constants';

const ROWS_SPLIT_REGEX = /\n/m;

class TextBox extends BoxElement {

    constructor(content, options, data) {
        super(options);
        this.content = content;
        this.data = data;

        this._initContainer();
        if (this.options._autoReflow !== false) {
            this.reflow(new Box());
        }
    }

    _initContainer() {
        const options = this.options;
        const rows = String(this.content).split(ROWS_SPLIT_REGEX);
        const floatElement = new FloatElement({ vertical: true, align: options.align, wrap: false });
        const textOptions = deepExtend({ }, options, { opacity: 1, animation: null });

        this.container = floatElement;
        this.append(floatElement);

        for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            let text = new Text(rows[rowIdx].trim(), textOptions);
            floatElement.append(text);
        }
    }

    reflow(targetBox) {
        const options = this.options;
        const visualFn = options.visual;
        this.container.options.align = options.align;

        if (visualFn && !this._boxReflow) {
            let visualBox = targetBox;
            if (!visualBox.hasSize()) {
                this._boxReflow = true;
                this.reflow(visualBox);
                this._boxReflow = false;
                visualBox = this.box;
            }
            const visual = this.visual = visualFn(this.visualContext(visualBox));

            if (visual) {
                visualBox = rectToBox(visual.clippedBBox() || new geom.Rect());

                visual.options.zIndex = options.zIndex;
            }

            this.box = this.contentBox = this.paddingBox = visualBox;
        } else {
            super.reflow(targetBox);

            if (options.rotation) {
                const margin = getSpacing(options.margin);
                let box = this.box.unpad(margin);

                this.targetBox = targetBox;
                this.normalBox = box.clone();

                box = this.rotate();
                box.translate(margin.left - margin.right, margin.top - margin.bottom);

                this.rotatedBox = box.clone();

                box.pad(margin);
            }
        }
    }

    createVisual() {
        const options = this.options;

        this.visual = new draw.Group({
            transform: this.rotationTransform(),
            zIndex: options.zIndex,
            noclip: options.noclip
        });

        if (this.hasBox()) {
            const box = draw.Path.fromRect(this.paddingBox.toRect(), this.visualStyle());
            this.visual.append(box);
        }
    }

    renderVisual() {
        if (!this.options.visible) {
            return;
        }

        if (this.options.visual) {
            const visual = this.visual;
            if (visual && !defined(visual.options.noclip)) {
                visual.options.noclip = this.options.noclip;
            }
            this.addVisual();
            this.createAnimation();
        } else {
            super.renderVisual();
        }
    }

    visualContext(targetBox) {
        const context = {
            text: this.content,
            rect: targetBox.toRect(),
            sender: this.getSender(),
            options: this.options,
            createVisual: () => {
                this._boxReflow = true;
                this.reflow(targetBox);
                this._boxReflow = false;
                return this.getDefaultVisual();
            }
        };
        if (this.data) {
            Object.assign(context, this.data);
        }

        return context;
    }

    getDefaultVisual() {
        this.createVisual();
        this.renderChildren();
        const visual = this.visual;
        delete this.visual;
        return visual;
    }

    rotate() {
        const options = this.options;
        this.box.rotate(options.rotation);
        this.align(this.targetBox, X, options.align);
        this.align(this.targetBox, Y, options.vAlign);
        return this.box;
    }

    rotationTransform() {
        const rotation = this.options.rotation;
        if (!rotation) {
            return null;
        }

        const { x: cx, y: cy } = this.normalBox.center();
        const boxCenter = this.rotatedBox.center();

        return geom.transform()
                   .translate(boxCenter.x - cx, boxCenter.y - cy)
                   .rotate(rotation, [ cx, cy ]);
    }
}

export default TextBox;