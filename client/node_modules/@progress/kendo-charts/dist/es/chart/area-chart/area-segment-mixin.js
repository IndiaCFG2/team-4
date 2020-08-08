import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { X, Y } from '../../common/constants';
import { deepExtend, isFunction, last, limitValue } from '../../common';

var AreaSegmentMixin = {
    points: function() {
        var chart = this.parent;
        var plotArea = chart.plotArea;
        var invertAxes = chart.options.invertAxes;
        var valueAxis = chart.seriesValueAxis(this.series);
        var valueAxisLineBox = valueAxis.lineBox();
        var categoryAxis = plotArea.seriesCategoryAxis(this.series);
        var categoryAxisLineBox = categoryAxis.lineBox();
        var stackPoints = this.stackPoints;
        var points = this._linePoints(stackPoints);
        var pos = invertAxes ? X : Y;
        var end = invertAxes ? categoryAxisLineBox.x1 : categoryAxisLineBox.y1;

        end = limitValue(end, valueAxisLineBox[pos + 1], valueAxisLineBox[pos + 2]);
        if (!this.stackPoints && points.length > 1) {
            var firstPoint = points[0];
            var lastPoint = last(points);

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
        var series = this.series;
        var defaults = series._defaults;
        var color = series.color;

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
        var series = this.series;
        var lineOptions = deepExtend({
            color: color,
            opacity: series.opacity
        }, series.line);

        if (lineOptions.visible !== false && lineOptions.width > 0) {
            var line = draw.Path.fromPoints(this._linePoints(), {
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
        var series = this.series;

        var area = draw.Path.fromPoints(this.points(), {
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