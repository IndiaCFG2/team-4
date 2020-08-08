import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement } from '../../core';

import { defined, isFunction, setDefaultOptions } from '../../common';

var LineSegment = (function (ChartElement) {
    function LineSegment(linePoints, series, seriesIx) {
        ChartElement.call(this);

        this.linePoints = linePoints;
        this.series = series;
        this.seriesIx = seriesIx;
    }

    if ( ChartElement ) LineSegment.__proto__ = ChartElement;
    LineSegment.prototype = Object.create( ChartElement && ChartElement.prototype );
    LineSegment.prototype.constructor = LineSegment;

    LineSegment.prototype.points = function points () {
        return this.toGeometryPoints(this.linePoints);
    };

    LineSegment.prototype.toGeometryPoints = function toGeometryPoints (points) {
        var result = [];
        for (var i = 0, length = points.length; i < length; i++) {
            if (points[i] && points[i].visible !== false) {
                result.push(points[i]._childBox.toRect().center());
            }
        }

        return result;
    };

    LineSegment.prototype.createVisual = function createVisual () {
        var this$1 = this;

        var customVisual = this.series.visual;
        if (customVisual) {
            this.visual = customVisual({
                points: this.toGeometryPoints(this.linePoints),
                series: this.series,
                sender: this.getSender(),
                createVisual: function () {
                    this$1.segmentVisual();

                    return this$1.visual;
                }
            });
            if (this.visual && !defined(this.visual.options.zIndex)) {
                this.visual.options.zIndex = this.series.zIndex;
            }
        } else {
            this.segmentVisual();
        }
    };

    LineSegment.prototype.segmentVisual = function segmentVisual () {
        var ref = this;
        var options = ref.options;
        var series = ref.series;
        var color = series.color;
        var defaults = series._defaults;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        var line = draw.Path.fromPoints(this.points(), {
            stroke: {
                color: color,
                width: series.width,
                opacity: series.opacity,
                dashType: series.dashType
            },
            zIndex: series.zIndex
        });

        if (options.closed) {
            line.close();
        }

        this.visual = line;
    };

    LineSegment.prototype.aliasFor = function aliasFor (e, coords) {
        return this.parent.getNearestPoint(coords.x, coords.y, this.seriesIx);
    };

    return LineSegment;
}(ChartElement));

setDefaultOptions(LineSegment, {
    closed: false
});

export default LineSegment;