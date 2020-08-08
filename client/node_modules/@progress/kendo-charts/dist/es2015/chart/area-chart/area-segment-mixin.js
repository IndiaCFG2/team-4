import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { X, Y } from '../../common/constants';
import { deepExtend, isFunction, last, limitValue } from '../../common';

const AreaSegmentMixin = {
    points: function() {
        const chart = this.parent;
        const plotArea = chart.plotArea;
        const invertAxes = chart.options.invertAxes;
        const valueAxis = chart.seriesValueAxis(this.series);
        const valueAxisLineBox = valueAxis.lineBox();
        const categoryAxis = plotArea.seriesCategoryAxis(this.series);
        const categoryAxisLineBox = categoryAxis.lineBox();
        const stackPoints = this.stackPoints;
        const points = this._linePoints(stackPoints);
        const pos = invertAxes ? X : Y;
        let end = invertAxes ? categoryAxisLineBox.x1 : categoryAxisLineBox.y1;

        end = limitValue(end, valueAxisLineBox[pos + 1], valueAxisLineBox[pos + 2]);
        if (!this.stackPoints && points.length > 1) {
            const firstPoint = points[0];
            const lastPoint = last(points);

            if (invertAxes) {
                points.unshift(new geom.Point(end, firstPoint.y));
                points.push(new geom.Point(end, lastPoint.y));
            } else {
                points.unshift(new geom.Point(firstPoint.x, end));
                points.push(new geom.Point(lastPoint.x, end));
            }
        }

        return points;
    },

    createVisual: function() {
        const series = this.series;
        const defaults = series._defaults;
        let color = series.color;

        if (isFunction(color) && defaults) {
            color = defaults.color;
        }

        this.visual = new draw.Group({
            zIndex: series.zIndex
        });

        this.createArea(color);
        this.createLine(color);
    },

    createLine: function(color) {
        const series = this.series;
        const lineOptions = deepExtend({
            color: color,
            opacity: series.opacity
        }, series.line);

        if (lineOptions.visible !== false && lineOptions.width > 0) {
            const line = draw.Path.fromPoints(this._linePoints(), {
                stroke: {
                    color: lineOptions.color,
                    width: lineOptions.width,
                    opacity: lineOptions.opacity,
                    dashType: lineOptions.dashType,
                    lineCap: "butt"
                }
            });

            this.visual.append(line);
        }
    },

    createArea: function(color) {
        const series = this.series;

        const area = draw.Path.fromPoints(this.points(), {
            fill: {
                color: color,
                opacity: series.opacity
            },
            stroke: null
        });

        this.visual.append(area);
    }
};

export default AreaSegmentMixin;