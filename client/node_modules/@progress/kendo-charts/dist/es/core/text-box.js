import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import BoxElement from './box-element';
import FloatElement from './float-element';
import Text from './text';
import Box from './box';

import rectToBox from './utils/rect-to-box';

import { getSpacing, deepExtend, defined } from '../common';
import { X, Y } from '../common/constants';

var ROWS_SPLIT_REGEX = /\n/m;

var TextBox = (function (BoxElement) {
    function TextBox(content, options, data) {
        BoxElement.call(this, options);
        this.content = content;
        this.data = data;

        this._initContainer();
        if (this.options._autoReflow !== false) {
            this.reflow(new Box());
        }
    }

    if ( BoxElement ) TextBox.__proto__ = BoxElement;
    TextBox.prototype = Object.create( BoxElement && BoxElement.prototype );
    TextBox.prototype.constructor = TextBox;

    TextBox.prototype._initContainer = function _initContainer () {
        var options = this.options;
        var rows = String(this.content).split(ROWS_SPLIT_REGEX);
        var floatElement = new FloatElement({ vertical: true, align: options.align, wrap: false });
        var textOptions = deepExtend({ }, options, { opacity: 1, animation: null });

        this.container = floatElement;
        this.append(floatElement);

        for (var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            var text = new Text(rows[rowIdx].trim(), textOptions);
            floatElement.append(text);
        }
    };

    TextBox.prototype.reflow = function reflow (targetBox) {
        var options = this.options;
        var visualFn = options.visual;
        this.container.options.align = options.align;

        if (visualFn && !this._boxReflow) {
            var visualBox = targetBox;
            if (!visualBox.hasSize()) {
                this._boxReflow = true;
                this.reflow(visualBox);
                this._boxReflow = false;
                visualBox = this.box;
            }
            var visual = this.visual = visualFn(this.visualContext(visualBox));

            if (visual) {
                visualBox = rectToBox(visual.clippedBBox() || new geom.Rect());

                visual.options.zIndex = options.zIndex;
            }

            this.box = this.contentBox = this.paddingBox = visualBox;
        } else {
            BoxElement.prototype.reflow.call(this, targetBox);

            if (options.rotation) {
                var margin = getSpacing(options.margin);
                var box = this.box.unpad(margin);

                this.targetBox = targetBox;
                this.normalBox = box.clone();

                box = this.rotate();
                box.translate(margin.left - margin.right, margin.top - margin.bottom);

                this.rotatedBox = box.clone();

                box.pad(margin);
            }
        }
    };

    TextBox.prototype.createVisual = function createVisual () {
        var options = this.options;

        this.visual = new draw.Group({
            transform: this.rotationTransform(),
            zIndex: options.zIndex,
            noclip: options.noclip
        });

        if (this.hasBox()) {
            var box = draw.Path.fromRect(this.paddingBox.toRect(), this.visualStyle());
            this.visual.append(box);
        }
    };

    TextBox.prototype.renderVisual = function renderVisual () {
        if (!this.options.visible) {
            return;
        }

        if (this.options.visual) {
            var visual = this.visual;
            if (visual && !defined(visual.options.noclip)) {
                visual.options.noclip = this.options.noclip;
            }
            this.addVisual();
            this.createAnimation();
        } else {
            BoxElement.prototype.renderVisual.call(this);
        }
    };

    TextBox.prototype.visualContext = function visualContext (targetBox) {
        var this$1 = this;

        var context = {
            text: this.content,
            rect: targetBox.toRect(),
            sender: this.getSender(),
            options: this.options,
            createVisual: function () {
                this$1._boxReflow = true;
                this$1.reflow(targetBox);
                this$1._boxReflow = false;
                return this$1.getDefaultVisual();
            }
        };
        if (this.data) {
            Object.assign(context, this.data);
        }

        return context;
    };

    TextBox.prototype.getDefaultVisual = function getDefaultVisual () {
        this.createVisual();
        this.renderChildren();
        var visual = this.visual;
        delete this.visual;
        return visual;
    };

    TextBox.prototype.rotate = function rotate () {
        var options = this.options;
        this.box.rotate(options.rotation);
        this.align(this.targetBox, X, options.align);
        this.align(this.targetBox, Y, options.vAlign);
        return this.box;
    };

    TextBox.prototype.rotationTransform = function rotationTransform () {
        var rotation = this.options.rotation;
        if (!rotation) {
            return null;
        }

        var ref = this.normalBox.center();
        var cx = ref.x;
        var cy = ref.y;
        var boxCenter = this.rotatedBox.center();

        return geom.transform()
                   .translate(boxCenter.x - cx, boxCenter.y - cy)
                   .rotate(rotation, [ cx, cy ]);
    };

    return TextBox;
}(BoxElement));

export default TextBox;