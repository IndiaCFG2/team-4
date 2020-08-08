import { geometry as geom, drawing as draw } from '@progress/kendo-drawing';

import GridLinesMixin from './mixins/grid-lines-mixin';
import CategoryAxis from './category-axis';
import ShapeBuilder from './shape-builder';
import Ring from './ring';
import Box from './box';

import { COORD_PRECISION, ARC } from '../common/constants';
import { deepExtend, getSpacing, inArray, limitValue, map, rad, round, setDefaultOptions } from '../common';

class RadarCategoryAxis extends CategoryAxis {
    range() {
        return { min: 0, max: this.options.categories.length };
    }

    reflow(box) {
        this.box = box;
        this.reflowLabels();
    }

    lineBox() {
        return this.box;
    }

    reflowLabels() {
        const { labels, options: { labels: labelOptions } } = this;
        const skip = labelOptions.skip || 0;
        const step = labelOptions.step || 1;
        const measureBox = new Box();

        for (let i = 0; i < labels.length; i++) {
            labels[i].reflow(measureBox);
            const labelBox = labels[i].box;

            labels[i].reflow(this.getSlot(skip + i * step).adjacentBox(
                0, labelBox.width(), labelBox.height()
            ));
        }
    }

    intervals(size, skipOption, stepOption, skipAngles = false) {
        const options = this.options;
        const categories = options.categories.length;
        const divCount = categories / size || 1;
        const divAngle = 360 / divCount;
        const skip = skipOption || 0;
        const step = stepOption || 1;
        const divs = [];
        let angle = 0;

        for (let i = skip; i < divCount; i += step) {
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
    }

    majorIntervals() {
        return this.intervals(1);
    }

    minorIntervals() {
        return this.intervals(0.5);
    }

    intervalAngle(interval) {
        return (360 + interval + this.options.startAngle) % 360;
    }

    majorAngles() {
        return map(this.majorIntervals(), (interval) => this.intervalAngle(interval));
    }

    createLine() {
        return [];
    }

    majorGridLineAngles(altAxis) {
        const majorGridLines = this.options.majorGridLines;
        return this.gridLineAngles(altAxis, 1, majorGridLines.skip, majorGridLines.step);
    }

    minorGridLineAngles(altAxis, skipMajor) {
        const { minorGridLines, majorGridLines } = this.options;
        const majorGridLineAngles = skipMajor ? this.intervals(1, majorGridLines.skip, majorGridLines.step) : null;

        return this.gridLineAngles(altAxis, 0.5, minorGridLines.skip, minorGridLines.step, majorGridLineAngles);
    }

    radiusCallback(radius, altAxis, skipMajor) {
        if (altAxis.options.type !== ARC) {
            const minorAngle = rad(360 / (this.options.categories.length * 2));
            const minorRadius = Math.cos(minorAngle) * radius;
            const majorAngles = this.majorAngles();

            const radiusCallback = function(angle) {
                if (!skipMajor && inArray(angle, majorAngles)) {
                    return radius;
                }

                return minorRadius;
            };
            return radiusCallback;
        }
    }

    createPlotBands() {
        const plotBands = this.options.plotBands || [];

        const group = this._plotbandGroup = new draw.Group({
            zIndex: -1
        });

        for (let i = 0; i < plotBands.length; i++) {
            const band = plotBands[i];
            const slot = this.plotBandSlot(band);
            const singleSlot = this.getSlot(band.from);

            const head = band.from - Math.floor(band.from);
            slot.startAngle += head * singleSlot.angle;

            const tail = Math.ceil(band.to) - band.to;
            slot.angle -= (tail + head) * singleSlot.angle;

            const ring = ShapeBuilder.current.createRing(slot, {
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
    }

    plotBandSlot(band) {
        return this.getSlot(band.from, band.to - 1);
    }

    getSlot(from, to) {
        const options = this.options;
        const justified = options.justified;
        const box = this.box;
        const divs = this.majorAngles();
        const totalDivs = divs.length;
        const slotAngle = 360 / totalDivs;
        let fromValue = from;

        if (options.reverse && !justified) {
            fromValue = (fromValue + 1) % totalDivs;
        }

        fromValue = limitValue(Math.floor(fromValue), 0, totalDivs - 1);
        let slotStart = divs[fromValue];

        if (justified) {
            slotStart = slotStart - slotAngle / 2;

            if (slotStart < 0) {
                slotStart += 360;
            }
        }

        const toValue = limitValue(Math.ceil(to || fromValue), fromValue, totalDivs - 1);
        const slots = toValue - fromValue + 1;
        const angle = slotAngle * slots;

        return new Ring(box.center(), 0, box.height() / 2, slotStart, angle);
    }

    slot(from, to) {
        const slot = this.getSlot(from, to);
        const startAngle = slot.startAngle + 180;
        const endAngle = startAngle + slot.angle;

        return new geom.Arc([ slot.center.x, slot.center.y ], {
            startAngle: startAngle,
            endAngle: endAngle,
            radiusX: slot.radius,
            radiusY: slot.radius
        });
    }

    pointCategoryIndex(point) {
        const length = this.options.categories.length;
        let index = null;

        for (let i = 0; i < length; i++) {
            const slot = this.getSlot(i);
            if (slot.containsPoint(point)) {
                index = i;
                break;
            }
        }

        return index;
    }
}

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