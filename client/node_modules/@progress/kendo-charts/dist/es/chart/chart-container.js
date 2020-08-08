import { drawing as draw } from '@progress/kendo-drawing';
import { alignPathToPixel } from '../common';

import { ChartElement } from '../core';

var ChartContainer = (function (ChartElement) {
    function ChartContainer(options, pane) {
        ChartElement.call(this, options);
        this.pane = pane;
    }

    if ( ChartElement ) ChartContainer.__proto__ = ChartElement;
    ChartContainer.prototype = Object.create( ChartElement && ChartElement.prototype );
    ChartContainer.prototype.constructor = ChartContainer;

    ChartContainer.prototype.shouldClip = function shouldClip () {
        var children = this.children;
        var length = children.length;

        for (var i = 0; i < length; i++) {
            if (children[i].options.clip === true) {
                return true;
            }
        }
        return false;
    };

    ChartContainer.prototype._clipBox = function _clipBox () {
        return this.pane.chartsBox();
    };

    ChartContainer.prototype.createVisual = function createVisual () {
        this.visual = new draw.Group({
            zIndex: 0
        });

        if (this.shouldClip()) {
            var clipBox = this.clipBox = this._clipBox();
            var clipRect = clipBox.toRect();
            var clipPath = draw.Path.fromRect(clipRect);
            alignPathToPixel(clipPath);

            this.visual.clip(clipPath);
            this.unclipLabels();
        }
    };

    ChartContainer.prototype.stackRoot = function stackRoot () {
        return this;
    };

    ChartContainer.prototype.unclipLabels = function unclipLabels () {
        var ref = this;
        var charts = ref.children;
        var clipBox = ref.clipBox;

        for (var i = 0; i < charts.length; i++) {
            var points = charts[i].points || {};
            var length = points.length;

            for (var j = 0; j < length; j++) {
                var point = points[j];
                if (point && point.visible !== false && point.overlapsBox && point.overlapsBox(clipBox)) {
                    if (point.unclipElements) {
                        point.unclipElements();
                    } else {
                        var label = point.label;
                        var note = point.note;

                        if (label && label.options.visible) {
                            if (label.alignToClipBox) {
                                label.alignToClipBox(clipBox);
                            }
                            label.options.noclip = true;
                        }

                        if (note && note.options.visible) {
                            note.options.noclip = true;
                        }
                    }
                }
            }
        }
    };

    ChartContainer.prototype.destroy = function destroy () {
        ChartElement.prototype.destroy.call(this);

        delete this.parent;
    };

    return ChartContainer;
}(ChartElement));

ChartContainer.prototype.isStackRoot = true;

export default ChartContainer;