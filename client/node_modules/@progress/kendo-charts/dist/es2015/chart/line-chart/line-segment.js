import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement } from '../../core';

import { defined, isFunction, setDefaultOptions } from '../../common';

class LineSegment extends ChartElement {
    constructor(linePoints, series, seriesIx) {
        super();

        this.linePoints = linePoints;
        this.series = series;
        this.seriesIx = seriesIx;
    }

    points() {
        return this.toGeometryPoints(this.linePoints);
    }

    toGeometryPoints(points) {
        const result = [];
        for (let i = 0, length = points.length; i < length; i++) {
            if (points[i] && points[i].visible !== false) {
                result.push(points[i]._childBox.toRect().center());
            }
        }

        return result;
    }

    createVisual() {
        const customVisual = this.series.visual;
        if (customVisual) {
            this.visual = customVisual({
                points: this.toGeometryPoints(this.linePoints),
                series: this.series,
                sender: this.getSender(),
                createVisual: () => {
                    this.segmentVisual();

                    return this.visual;
                }
            });
            if (this.visual && !defined(this.visual.options.zIndex)) {
                this.visual.options.zIndex = this.series.zIndex;
            }
        } else {
            this.segmentVisual();
        }
    }

    segmentVisual() {
        const { options, series } = this;
        let { color, _defaults: defaults } = series;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        const line = draw.Path.fromPoints(this.points(), {
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
    }

    aliasFor(e, coords) {
        return this.parent.getNearestPoint(coords.x, coords.y, this.seriesIx);
    }
}

setDefaultOptions(LineSegment, {
    closed: false
});

export default LineSegment;