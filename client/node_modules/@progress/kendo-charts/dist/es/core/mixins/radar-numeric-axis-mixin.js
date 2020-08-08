import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import ShapeBuilder from '../shape-builder';
import Ring from '../ring';
import Point from '../point';

import { ARC } from '../../common/constants';
import { append, deg, rad } from '../../common';

var RadarNumericAxisMixin = {
    options: {
        majorGridLines: {
            visible: true
        }
    },

    createPlotBands: function() {
        var this$1 = this;

        var ref = this.options;
        var type = ref.majorGridLines.type;
        var plotBands = ref.plotBands; if ( plotBands === void 0 ) plotBands = [];
        var altAxis = this.plotArea.polarAxis;
        var majorAngles = altAxis.majorAngles();
        var center = altAxis.box.center();
        var group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        for (var i = 0; i < plotBands.length; i++) {
            var band = plotBands[i];
            var bandStyle = {
                fill: {
                    color: band.color,
                    opacity: band.opacity
                },
                stroke: {
                    opacity: band.opacity
                }
            };

            var slot = this$1.getSlot(band.from, band.to, true);
            var ring = new Ring(center, center.y - slot.y2, center.y - slot.y1, 0, 360);

            var shape = (void 0);
            if (type === ARC) {
                shape = ShapeBuilder.current.createRing(ring, bandStyle);
            } else {
                shape = draw.Path.fromPoints(this$1.plotBandPoints(ring, majorAngles), bandStyle).close();
            }

            group.append(shape);
        }

        this.appendVisual(group);
    },

    plotBandPoints: function(ring, angles) {
        var innerPoints = [];
        var outerPoints = [];
        var center = [ ring.center.x, ring.center.y ];
        var innerCircle = new geom.Circle(center, ring.innerRadius);
        var outerCircle = new geom.Circle(center, ring.radius);

        for (var i = 0; i < angles.length; i++) {
            innerPoints.push(innerCircle.pointAt(angles[i] + 180));
            outerPoints.push(outerCircle.pointAt(angles[i] + 180));
        }

        innerPoints.reverse();
        innerPoints.push(innerPoints[0]);
        outerPoints.push(outerPoints[0]);

        return outerPoints.concat(innerPoints);
    },

    createGridLines: function(altAxis) {
        var options = this.options;
        var majorTicks = this.radarMajorGridLinePositions();
        var majorAngles = altAxis.majorAngles();
        var center = altAxis.box.center();
        var gridLines = [];

        if (options.majorGridLines.visible) {
            gridLines = this.renderGridLines(
                center, majorTicks, majorAngles, options.majorGridLines
            );
        }

        if (options.minorGridLines.visible) {
            var minorTicks = this.radarMinorGridLinePositions();
            append(gridLines, this.renderGridLines(
                center, minorTicks, majorAngles, options.minorGridLines
            ));
        }

        return gridLines;
    },

    renderGridLines: function(center, ticks, angles, options) {
        var style = {
            stroke: {
                width: options.width,
                color: options.color,
                dashType: options.dashType
            }
        };
        var skip = options.skip; if ( skip === void 0 ) skip = 0;
        var step = options.step; if ( step === void 0 ) step = 0;
        var container = this.gridLinesVisual();

        for (var tickIx = skip; tickIx < ticks.length; tickIx += step) {
            var tickRadius = center.y - ticks[tickIx];
            if (tickRadius > 0) {
                var circle = new geom.Circle([ center.x, center.y ], tickRadius);
                if (options.type === ARC) {
                    container.append(new draw.Circle(circle, style));
                } else {
                    var line = new draw.Path(style);
                    for (var angleIx = 0; angleIx < angles.length; angleIx++) {
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
        var lineBox = this.lineBox();
        var altAxis = this.plotArea.polarAxis;
        var majorAngles = altAxis.majorAngles();
        var center = altAxis.box.center();
        var radius = point.distanceTo(center);
        var distance = radius;

        if (this.options.majorGridLines.type !== ARC && majorAngles.length > 1) {
            var dx = point.x - center.x;
            var dy = point.y - center.y;
            var theta = (deg(Math.atan2(dy, dx)) + 540) % 360;

            majorAngles.sort(function(a, b) {
                return angularDistance(a, theta) - angularDistance(b, theta);
            });

            // Solve triangle (center, point, axis X) using one side (radius) and two angles.
            // Angles are derived from triangle (center, point, gridline X)
            var midAngle = angularDistance(majorAngles[0], majorAngles[1]) / 2;
            var alpha = angularDistance(theta, majorAngles[0]);
            var gamma = 90 - midAngle;
            var beta = 180 - alpha - gamma;

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