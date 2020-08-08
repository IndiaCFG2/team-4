import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import { append, map } from '../../common';

var GridLinesMixin = {
    createGridLines: function(altAxis) {
        var options = this.options;
        var radius = Math.abs(this.box.center().y - altAxis.lineBox().y1);
        var gridLines = [];
        var skipMajor = false;
        var majorAngles, minorAngles;

        if (options.majorGridLines.visible) {
            majorAngles = this.majorGridLineAngles(altAxis);
            skipMajor = true;

            gridLines = this.renderMajorGridLines(
                majorAngles, radius, options.majorGridLines
            );
        }

        if (options.minorGridLines.visible) {
            minorAngles = this.minorGridLineAngles(altAxis, skipMajor);

            append(gridLines, this.renderMinorGridLines(
                minorAngles, radius, options.minorGridLines, altAxis, skipMajor
            ));
        }

        return gridLines;
    },

    renderMajorGridLines: function(angles, radius, options) {
        return this.renderGridLines(angles, radius, options);
    },

    renderMinorGridLines: function(angles, radius, options, altAxis, skipMajor) {
        var radiusCallback = this.radiusCallback && this.radiusCallback(radius, altAxis, skipMajor);
        return this.renderGridLines(angles, radius, options, radiusCallback);
    },

    renderGridLines: function(angles, radius, options, radiusCallback) {
        var style = {
            stroke: {
                width: options.width,
                color: options.color,
                dashType: options.dashType
            }
        };

        var center = this.box.center();
        var circle = new geom.Circle([ center.x, center.y ], radius);
        var container = this.gridLinesVisual();

        for (var i = 0; i < angles.length; i++) {
            var line = new draw.Path(style);
            if (radiusCallback) {
                circle.radius = radiusCallback(angles[i]);
            }

            line.moveTo(circle.center)
                .lineTo(circle.pointAt(angles[i] + 180));

            container.append(line);
        }

        return container.children;
    },

    gridLineAngles: function(altAxis, size, skip, step, skipAngles) {
        var this$1 = this;

        var divs = this.intervals(size, skip, step, skipAngles);
        var options = altAxis.options;
        var altAxisVisible = options.visible && (options.line || {}).visible !== false;

        return map(divs, function (d) {
            var alpha = this$1.intervalAngle(d);

            if (!altAxisVisible || alpha !== 90) {
                return alpha;
            }
        });
    }
};

export default GridLinesMixin;