import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import { append, map } from '../../common';

const GridLinesMixin = {
    createGridLines: function(altAxis) {
        const options = this.options;
        const radius = Math.abs(this.box.center().y - altAxis.lineBox().y1);
        let gridLines = [];
        let skipMajor = false;
        let majorAngles, minorAngles;

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
        const radiusCallback = this.radiusCallback && this.radiusCallback(radius, altAxis, skipMajor);
        return this.renderGridLines(angles, radius, options, radiusCallback);
    },

    renderGridLines: function(angles, radius, options, radiusCallback) {
        const style = {
            stroke: {
                width: options.width,
                color: options.color,
                dashType: options.dashType
            }
        };

        const center = this.box.center();
        const circle = new geom.Circle([ center.x, center.y ], radius);
        const container = this.gridLinesVisual();

        for (let i = 0; i < angles.length; i++) {
            const line = new draw.Path(style);
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
        const divs = this.intervals(size, skip, step, skipAngles);
        const options = altAxis.options;
        const altAxisVisible = options.visible && (options.line || {}).visible !== false;

        return map(divs, (d) => {
            const alpha = this.intervalAngle(d);

            if (!altAxisVisible || alpha !== 90) {
                return alpha;
            }
        });
    }
};

export default GridLinesMixin;