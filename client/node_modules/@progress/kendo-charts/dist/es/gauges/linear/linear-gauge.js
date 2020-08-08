import { drawing } from '@progress/kendo-drawing';
import { Box } from '../../core';
import { setDefaultOptions, deepExtend, isArray } from '../../common';
import { ARROW, DEFAULT_WIDTH, DEFAULT_HEIGHT } from '../constants';
import Gauge from '../gauge';
import LinearScale from './linear-scale';
import ArrowLinearPointer from './arrow-linear-pointer';
import BarLinearPointer from './bar-linear-pointer';

var DEFAULT_MIN_WIDTH = 60;
var DEFAULT_MIN_HEIGHT = 60;

var Group = drawing.Group;

var LinearGauge = (function (Gauge) {
    function LinearGauge () {
        Gauge.apply(this, arguments);
    }

    if ( Gauge ) LinearGauge.__proto__ = Gauge;
    LinearGauge.prototype = Object.create( Gauge && Gauge.prototype );
    LinearGauge.prototype.constructor = LinearGauge;

    LinearGauge.prototype.reflow = function reflow (bbox) {
        var pointers = this.pointers;
        var bboxX = bbox.origin.x;
        var bboxY = bbox.origin.y;

        var box = new Box(bboxX, bboxY, bboxX + bbox.width(), bboxY + bbox.height());

        this.scale.reflow(box);
        this._shrinkScaleWidth(box);

        for (var i = 0; i < pointers.length; i++) {
            pointers[i].reflow();
        }

        this.bbox = this._getBox(box);
        this._alignElements();
        this._shrinkElements();
        this._buildVisual();
        this._draw();
    };

    LinearGauge.prototype._buildVisual = function _buildVisual () {
        var visuals = new Group();
        var scaleElements = this.scale.render();
        var pointers = this.pointers;

        visuals.append(this.gaugeArea);
        visuals.append(scaleElements);

        for (var i = 0; i < pointers.length; i++) {
            var current = pointers[i];
            visuals.append(current.render());
            current.value(current.options.value);
        }

        this._visuals = visuals;
    };

    LinearGauge.prototype._createModel = function _createModel () {
        var this$1 = this;

        var options = this.options;
        var scale = this.scale = new LinearScale(options.scale, this.contextService);

        this.pointers = [];

        var pointers = options.pointer;
        pointers = isArray(pointers) ? pointers : [ pointers ];

        for (var i = 0; i < pointers.length; i++) {
            var currentOptions = deepExtend({}, pointers[i], {
                animation: {
                    transitions: options.transitions
                }
            });
            var pointerType = currentOptions.shape === ARROW ? ArrowLinearPointer : BarLinearPointer;

            this$1.pointers.push(new pointerType(scale, currentOptions));
        }
    };

    LinearGauge.prototype._defaultSize = function _defaultSize () {
        var vertical = this.options.scale.vertical;

        return {
            width: vertical ? DEFAULT_MIN_WIDTH : DEFAULT_WIDTH,
            height: vertical ? DEFAULT_HEIGHT : DEFAULT_MIN_HEIGHT
        };
    };

    LinearGauge.prototype._getBox = function _getBox (box) {
        var ref = this;
        var scale = ref.scale;
        var pointers = ref.pointers;
        var boxCenter = box.center();
        var plotAreaBox = pointers[0].box.clone().wrap(scale.box);

        for (var i = 0; i < pointers.length; i++) {
            plotAreaBox.wrap(pointers[i].box.clone());
        }

        var size;
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
    };

    LinearGauge.prototype._alignElements = function _alignElements () {
        var this$1 = this;

        var ref = this;
        var scale = ref.scale;
        var pointers = ref.pointers;
        var scaleBox = scale.box;
        var box = pointers[0].box.clone().wrap(scale.box);
        var plotAreaBox = this.bbox;

        for (var i = 0; i < pointers.length; i++) {
            box.wrap(pointers[i].box.clone());
        }

        var diff;
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

        for (var i$1 = 0; i$1 < pointers.length; i$1++) {
            pointers[i$1].reflow(this$1.bbox);
        }
    };

    LinearGauge.prototype._shrinkScaleWidth = function _shrinkScaleWidth (bbox) {
        var ref = this;
        var scale = ref.scale;
        if (!scale.options.vertical) {
            var overflow = scale.contentBox().width() - bbox.width();
            if (overflow > 0) {
                scale.box.shrink(overflow, 0);
                scale.box.alignTo(bbox, 'center');
                scale.reflow(scale.box);
            }
        }
    };

    LinearGauge.prototype._shrinkElements = function _shrinkElements () {
        var this$1 = this;

        var ref = this;
        var scale = ref.scale;
        var pointers = ref.pointers;
        var scaleBox = scale.box.clone();
        var pos = scale.options.vertical ? "y" : "x";
        var pointerBox = pointers[0].box;

        for (var i = 0; i < pointers.length; i++) {
            pointerBox.wrap(pointers[i].box.clone());
        }

        scaleBox[pos + 1] += Math.max(scaleBox[pos + 1] - pointerBox[pos + 1], 0);
        scaleBox[pos + 2] -= Math.max(pointerBox[pos + 2] - scaleBox[pos + 2], 0);

        scale.reflow(scaleBox);

        for (var i$1 = 0; i$1 < pointers.length; i$1++) {
            pointers[i$1].reflow(this$1.bbox);
        }
    };

    return LinearGauge;
}(Gauge));

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