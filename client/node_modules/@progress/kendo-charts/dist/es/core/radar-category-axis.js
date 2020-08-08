import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import GridLinesMixin from './mixins/grid-lines-mixin';
import CategoryAxis from './category-axis';
import ShapeBuilder from './shape-builder';
import Ring from './ring';
import Box from './box';

import { COORD_PRECISION, ARC } from '../common/constants';
import { deepExtend, getSpacing, inArray, limitValue, map, rad, round, setDefaultOptions } from '../common';

var RadarCategoryAxis = (function (CategoryAxis) {
    function RadarCategoryAxis () {
        CategoryAxis.apply(this, arguments);
    }

    if ( CategoryAxis ) RadarCategoryAxis.__proto__ = CategoryAxis;
    RadarCategoryAxis.prototype = Object.create( CategoryAxis && CategoryAxis.prototype );
    RadarCategoryAxis.prototype.constructor = RadarCategoryAxis;

    RadarCategoryAxis.prototype.range = function range () {
        return { min: 0, max: this.options.categories.length };
    };

    RadarCategoryAxis.prototype.reflow = function reflow (box) {
        this.box = box;
        this.reflowLabels();
    };

    RadarCategoryAxis.prototype.lineBox = function lineBox () {
        return this.box;
    };

    RadarCategoryAxis.prototype.reflowLabels = function reflowLabels () {
        var this$1 = this;

        var ref = this;
        var labels = ref.labels;
        var labelOptions = ref.options.labels;
        var skip = labelOptions.skip || 0;
        var step = labelOptions.step || 1;
        var measureBox = new Box();

        for (var i = 0; i < labels.length; i++) {
            labels[i].reflow(measureBox);
            var labelBox = labels[i].box;

            labels[i].reflow(this$1.getSlot(skip + i * step).adjacentBox(
                0, labelBox.width(), labelBox.height()
            ));
        }
    };

    RadarCategoryAxis.prototype.intervals = function intervals (size, skipOption, stepOption, skipAngles) {
        if ( skipAngles === void 0 ) skipAngles = false;

        var options = this.options;
        var categories = options.categories.length;
        var divCount = categories / size || 1;
        var divAngle = 360 / divCount;
        var skip = skipOption || 0;
        var step = stepOption || 1;
        var divs = [];
        var angle = 0;

        for (var i = skip; i < divCount; i += step) {
            if (options.reverse) {
                angle = 360 - i * divAngle;
            } else {
                angle = i * divAngle;
            }

            angle = round(angle, COORD_PRECISION) % 360;

            if (!(skipAngles && inArray(angle, skipAngles))) {
                divs.push(angle);
            }
        }

        return divs;
    };

    RadarCategoryAxis.prototype.majorIntervals = function majorIntervals () {
        return this.intervals(1);
    };

    RadarCategoryAxis.prototype.minorIntervals = function minorIntervals () {
        return this.intervals(0.5);
    };

    RadarCategoryAxis.prototype.intervalAngle = function intervalAngle (interval) {
        return (360 + interval + this.options.startAngle) % 360;
    };

    RadarCategoryAxis.prototype.majorAngles = function majorAngles () {
        var this$1 = this;

        return map(this.majorIntervals(), function (interval) { return this$1.intervalAngle(interval); });
    };

    RadarCategoryAxis.prototype.createLine = function createLine () {
        return [];
    };

    RadarCategoryAxis.prototype.majorGridLineAngles = function majorGridLineAngles (altAxis) {
        var majorGridLines = this.options.majorGridLines;
        return this.gridLineAngles(altAxis, 1, majorGridLines.skip, majorGridLines.step);
    };

    RadarCategoryAxis.prototype.minorGridLineAngles = function minorGridLineAngles (altAxis, skipMajor) {
        var ref = this.options;
        var minorGridLines = ref.minorGridLines;
        var majorGridLines = ref.majorGridLines;
        var majorGridLineAngles = skipMajor ? this.intervals(1, majorGridLines.skip, majorGridLines.step) : null;

        return this.gridLineAngles(altAxis, 0.5, minorGridLines.skip, minorGridLines.step, majorGridLineAngles);
    };

    RadarCategoryAxis.prototype.radiusCallback = function radiusCallback (radius, altAxis, skipMajor) {
        if (altAxis.options.type !== ARC) {
            var minorAngle = rad(360 / (this.options.categories.length * 2));
            var minorRadius = Math.cos(minorAngle) * radius;
            var majorAngles = this.majorAngles();

            var radiusCallback = function(angle) {
                if (!skipMajor && inArray(angle, majorAngles)) {
                    return radius;
                }

                return minorRadius;
            };
            return radiusCallback;
        }
    };

    RadarCategoryAxis.prototype.createPlotBands = function createPlotBands () {
        var this$1 = this;

        var plotBands = this.options.plotBands || [];

        var group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        for (var i = 0; i < plotBands.length; i++) {
            var band = plotBands[i];
            var slot = this$1.plotBandSlot(band);
            var singleSlot = this$1.getSlot(band.from);

            var head = band.from - Math.floor(band.from);
            slot.startAngle += head * singleSlot.angle;

            var tail = Math.ceil(band.to) - band.to;
            slot.angle -= (tail + head) * singleSlot.angle;

            var ring = ShapeBuilder.current.createRing(slot, {
                fill: {
                    color: band.color,
                    opacity: band.opacity
                },
                stroke: {
                    opacity: band.opacity
                }
            });
            group.append(ring);
        }

        this.appendVisual(group);
    };

    RadarCategoryAxis.prototype.plotBandSlot = function plotBandSlot (band) {
        return this.getSlot(band.from, band.to - 1);
    };

    RadarCategoryAxis.prototype.getSlot = function getSlot (from, to) {
        var options = this.options;
        var justified = options.justified;
        var box = this.box;
        var divs = this.majorAngles();
        var totalDivs = divs.length;
        var slotAngle = 360 / totalDivs;
        var fromValue = from;

        if (options.reverse && !justified) {
            fromValue = (fromValue + 1) % totalDivs;
        }

        fromValue = limitValue(Math.floor(fromValue), 0, totalDivs - 1);
        var slotStart = divs[fromValue];

        if (justified) {
            slotStart = slotStart - slotAngle / 2;

            if (slotStart < 0) {
                slotStart += 360;
            }
        }

        var toValue = limitValue(Math.ceil(to || fromValue), fromValue, totalDivs - 1);
        var slots = toValue - fromValue + 1;
        var angle = slotAngle * slots;

        return new Ring(box.center(), 0, box.height() / 2, slotStart, angle);
    };

    RadarCategoryAxis.prototype.slot = function slot (from, to) {
        var slot = this.getSlot(from, to);
        var startAngle = slot.startAngle + 180;
        var endAngle = startAngle + slot.angle;

        return new geom.Arc([ slot.center.x, slot.center.y ], {
            startAngle: startAngle,
            endAngle: endAngle,
            radiusX: slot.radius,
            radiusY: slot.radius
        });
    };

    RadarCategoryAxis.prototype.pointCategoryIndex = function pointCategoryIndex (point) {
        var this$1 = this;

        var length = this.options.categories.length;
        var index = null;

        for (var i = 0; i < length; i++) {
            var slot = this$1.getSlot(i);
            if (slot.containsPoint(point)) {
                index = i;
                break;
            }
        }

        return index;
    };

    return RadarCategoryAxis;
}(CategoryAxis));

setDefaultOptions(RadarCategoryAxis, {
    startAngle: 90,
    labels: {
        margin: getSpacing(10)
    },
    majorGridLines: {
        visible: true
    },
    justified: true
});
deepExtend(RadarCategoryAxis.prototype, GridLinesMixin);

export default RadarCategoryAxis;