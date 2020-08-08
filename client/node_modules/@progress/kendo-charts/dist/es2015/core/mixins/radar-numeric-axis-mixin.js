import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import ShapeBuilder from '../shape-builder';
import Ring from '../ring';
import Point from '../point';

import { ARC } from '../../common/constants';
import { append, deg, rad } from '../../common';

const RadarNumericAxisMixin = {
    options: {
        majorGridLines: {
            visible: true
        }
    },

    createPlotBands: function() {
        const { majorGridLines: { type }, plotBands = [] } = this.options;
        const altAxis = this.plotArea.polarAxis;
        const majorAngles = altAxis.majorAngles();
        const center = altAxis.box.center();
        const group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        for (let i = 0; i < plotBands.length; i++) {
            const band = plotBands[i];
            const bandStyle = {
                fill: {
                    color: band.color,
                    opacity: band.opacity
                },
                stroke: {
                    opacity: band.opacity
                }
            };

            const slot = this.getSlot(band.from, band.to, true);
            const ring = new Ring(center, center.y - slot.y2, center.y - slot.y1, 0, 360);

            let shape;
            if (type === ARC) {
                shape = ShapeBuilder.current.createRing(ring, bandStyle);
            } else {
                shape = draw.Path.fromPoints(this.plotBandPoints(ring, majorAngles), bandStyle).close();
            }

            group.append(shape);
        }

        this.appendVisual(group);
    },

    plotBandPoints: function(ring, angles) {
        const innerPoints = [];
        const outerPoints = [];
        const center = [ ring.center.x, ring.center.y ];
        const innerCircle = new geom.Circle(center, ring.innerRadius);
        const outerCircle = new geom.Circle(center, ring.radius);

        for (let i = 0; i < angles.length; i++) {
            innerPoints.push(innerCircle.pointAt(angles[i] + 180));
            outerPoints.push(outerCircle.pointAt(angles[i] + 180));
        }

        innerPoints.reverse();
        innerPoints.push(innerPoints[0]);
        outerPoints.push(outerPoints[0]);

        return outerPoints.concat(innerPoints);
    },

    createGridLines: function(altAxis) {
        const options = this.options;
        const majorTicks = this.radarMajorGridLinePositions();
        const majorAngles = altAxis.majorAngles();
        const center = altAxis.box.center();
        let gridLines = [];

        if (options.majorGridLines.visible) {
            gridLines = this.renderGridLines(
                center, majorTicks, majorAngles, options.majorGridLines
            );
        }

        if (options.minorGridLines.visible) {
            const minorTicks = this.radarMinorGridLinePositions();
            append(gridLines, this.renderGridLines(
                center, minorTicks, majorAngles, options.minorGridLines
            ));
        }

        return gridLines;
    },

    renderGridLines: function(center, ticks, angles, options) {
        const style = {
            stroke: {
                width: options.width,
                color: options.color,
                dashType: options.dashType
            }
        };
        const { skip = 0, step = 0 } = options;
        const container = this.gridLinesVisual();

        for (let tickIx = skip; tickIx < ticks.length; tickIx += step) {
            const tickRadius = center.y - ticks[tickIx];
            if (tickRadius > 0) {
                const circle = new geom.Circle([ center.x, center.y ], tickRadius);
                if (options.type === ARC) {
                    container.append(new draw.Circle(circle, style));
                } else {
                    const line = new draw.Path(style);
                    for (let angleIx = 0; angleIx < angles.length; angleIx++) {
                        line.lineTo(circle.pointAt(angles[angleIx] + 180));
                    }

                    line.close();
                    container.append(line);
                }
            }
        }

        return container.children;
    },

    getValue: function(point) {
        const lineBox = this.lineBox();
        const altAxis = this.plotArea.polarAxis;
        const majorAngles = altAxis.majorAngles();
        const center = altAxis.box.center();
        const radius = point.distanceTo(center);
        let distance = radius;

        if (this.options.majorGridLines.type !== ARC && majorAngles.length > 1) {
            const dx = point.x - center.x;
            const dy = point.y - center.y;
            const theta = (deg(Math.atan2(dy, dx)) + 540) % 360;

            majorAngles.sort(function(a, b) {
                return angularDistance(a, theta) - angularDistance(b, theta);
            });

            // Solve triangle (center, point, axis X) using one side (radius) and two angles.
            // Angles are derived from triangle (center, point, gridline X)
            const midAngle = angularDistance(majorAngles[0], majorAngles[1]) / 2;
            const alpha = angularDistance(theta, majorAngles[0]);
            const gamma = 90 - midAngle;
            const beta = 180 - alpha - gamma;

            distance = radius * (Math.sin(rad(beta)) / Math.sin(rad(gamma)));
        }

        return this.axisType().prototype.getValue.call(
            this, new Point(lineBox.x1, lineBox.y2 - distance)
        );
    }
};

function angularDistance(a, b) {
    return 180 - Math.abs(Math.abs(a - b) - 180);
}

export default RadarNumericAxisMixin;