import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement } from '../../core';

import { FADEIN, INITIAL_ANIMATION_DURATION } from '../constants';

import { alignPathToPixel, setDefaultOptions } from '../../common';

var WaterfallSegment = (function (ChartElement) {
    function WaterfallSegment(from, to, series) {
        ChartElement.call(this);

        this.from = from;
        this.to = to;
        this.series = series;
    }

    if ( ChartElement ) WaterfallSegment.__proto__ = ChartElement;
    WaterfallSegment.prototype = Object.create( ChartElement && ChartElement.prototype );
    WaterfallSegment.prototype.constructor = WaterfallSegment;

    WaterfallSegment.prototype.linePoints = function linePoints () {
        var from = this.from;
        var ref = this;
        var fromBox = ref.from.box;
        var toBox = ref.to.box;
        var points = [];

        if (from.isVertical) {
            var y = from.aboveAxis ? fromBox.y1 : fromBox.y2;
            points.push(
                [ fromBox.x1, y ],
                [ toBox.x2, y ]
            );
        } else {
            var x = from.aboveAxis ? fromBox.x2 : fromBox.x1;
            points.push(
                [ x, fromBox.y1 ],
                [ x, toBox.y2 ]
            );
        }

        return points;
    };

    WaterfallSegment.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);

        var line = this.series.line || {};

        var path = draw.Path.fromPoints(this.linePoints(), {
            stroke: {
                color: line.color,
                width: line.width,
                opacity: line.opacity,
                dashType: line.dashType
            }
        });

        alignPathToPixel(path);
        this.visual.append(path);
    };

    return WaterfallSegment;
}(ChartElement));

setDefaultOptions(WaterfallSegment, {
    animation: {
        type: FADEIN,
        delay: INITIAL_ANIMATION_DURATION
    }
});

export default WaterfallSegment;