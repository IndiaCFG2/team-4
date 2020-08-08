import { Color } from '@progress/kendo-drawing';

import Candlestick from '../candlestick-chart/candlestick';
import PointEventsMixin from '../mixins/point-events-mixin';
import { ShapeElement } from '../../core';

import { LINE_MARKER_SIZE, BORDER_BRIGHTNESS } from '../constants';

import { CROSS, CIRCLE, WHITE } from '../../common/constants';
import { deepExtend, defined, setDefaultOptions } from '../../common';

class BoxPlot extends Candlestick {
    constructor(value, options) {
        super(value, options);

        this.createNote();
    }

    reflow(box) {
        const { options, value, owner: chart } = this;
        const valueAxis = chart.seriesValueAxis(options);
        let whiskerSlot, boxSlot;

        this.boxSlot = boxSlot = valueAxis.getSlot(value.q1, value.q3);
        this.realBody = boxSlot;
        this.reflowBoxSlot(box);

        this.whiskerSlot = whiskerSlot = valueAxis.getSlot(value.lower, value.upper);
        this.reflowWhiskerSlot(box);

        const medianSlot = valueAxis.getSlot(value.median);

        if (value.mean) {
            const meanSlot = valueAxis.getSlot(value.mean);
            this.meanPoints = this.calcMeanPoints(box, meanSlot);
        }

        this.whiskerPoints = this.calcWhiskerPoints(boxSlot, whiskerSlot);
        this.medianPoints = this.calcMedianPoints(box, medianSlot);

        this.box = whiskerSlot.clone().wrap(boxSlot);
        this.reflowNote();
    }

    reflowBoxSlot(box) {
        this.boxSlot.x1 = box.x1;
        this.boxSlot.x2 = box.x2;
    }

    reflowWhiskerSlot(box) {
        this.whiskerSlot.x1 = box.x1;
        this.whiskerSlot.x2 = box.x2;
    }

    calcMeanPoints(box, meanSlot) {
        return [
            [ [ box.x1, meanSlot.y1 ], [ box.x2, meanSlot.y1 ] ]
        ];
    }

    calcWhiskerPoints(boxSlot, whiskerSlot) {
        const mid = whiskerSlot.center().x;
        return [ [
            [ mid - 5, whiskerSlot.y1 ], [ mid + 5, whiskerSlot.y1 ],
            [ mid, whiskerSlot.y1 ], [ mid, boxSlot.y1 ]
        ], [
            [ mid - 5, whiskerSlot.y2 ], [ mid + 5, whiskerSlot.y2 ],
            [ mid, whiskerSlot.y2 ], [ mid, boxSlot.y2 ]
        ] ];
    }

    calcMedianPoints(box, medianSlot) {
        return [
            [ [ box.x1, medianSlot.y1 ], [ box.x2, medianSlot.y1 ] ]
        ];
    }

    renderOutliers(options) {
        const value = this.value;
        const outliers = value.outliers || [];
        const outerFence = Math.abs(value.q3 - value.q1) * 3;
        const elements = [];
        let markers = options.markers || {};

        for (let i = 0; i < outliers.length; i++) {
            const outlierValue = outliers[i];
            if (outlierValue < value.q3 + outerFence && outlierValue > value.q1 - outerFence) {
                markers = options.outliers;
            } else {
                markers = options.extremes;
            }
            let markersBorder = deepExtend({}, markers.border);

            if (!defined(markersBorder.color)) {
                if (defined(this.color)) {
                    markersBorder.color = this.color;
                } else {
                    markersBorder.color =
                        new Color(markers.background).brightness(BORDER_BRIGHTNESS).toHex();
                }
            }

            const shape = new ShapeElement({
                type: markers.type,
                width: markers.size,
                height: markers.size,
                rotation: markers.rotation,
                background: markers.background,
                border: markersBorder,
                opacity: markers.opacity
            });

            shape.value = outlierValue;

            elements.push(shape);
        }

        this.reflowOutliers(elements);
        return elements;
    }

    reflowOutliers(outliers) {
        const valueAxis = this.owner.seriesValueAxis(this.options);
        const center = this.box.center();

        for (let i = 0; i < outliers.length; i++) {
            const outlierValue = outliers[i].value;
            const markerBox = valueAxis.getSlot(outlierValue);

            if (this.options.vertical) {
                markerBox.move(center.x);
            } else {
                markerBox.move(undefined, center.y);
            }

            this.box = this.box.wrap(markerBox);
            outliers[i].reflow(markerBox);
        }
    }

    mainVisual(options) {
        const group = super.mainVisual(options);
        const outliers = this.renderOutliers(options);

        for (let i = 0; i < outliers.length; i++) {
            const element = outliers[i].getElement();
            if (element) {
                group.append(element);
            }
        }

        return group;
    }

    createLines(container, options) {
        this.drawLines(container, options, this.whiskerPoints, options.whiskers);
        this.drawLines(container, options, this.medianPoints, options.median);
        this.drawLines(container, options, this.meanPoints, options.mean);
    }

    getBorderColor() {
        if ((this.options.border || {}).color) {
            return this.options.border.color;
        }

        if (this.color) {
            return this.color;
        }

        return super.getBorderColor();
    }
}

setDefaultOptions(BoxPlot, {
    border: {
        _brightness: 0.8
    },
    line: {
        width: 2
    },
    median: {
        color: "#f6f6f6"
    },
    mean: {
        width: 2,
        dashType: "dash",
        color: "#f6f6f6"
    },
    overlay: {
        gradient: "glass"
    },
    tooltip: {
        format: "<table>" +
                    "<tr><th colspan='2'>{6:d}</th></tr>" +
                    "<tr><td>Lower:</td><td>{0:C}</td></tr>" +
                    "<tr><td>Q1:</td><td>{1:C}</td></tr>" +
                    "<tr><td>Median:</td><td>{2:C}</td></tr>" +
                    "<tr><td>Mean:</td><td>{5:C}</td></tr>" +
                    "<tr><td>Q3:</td><td>{3:C}</td></tr>" +
                    "<tr><td>Upper:</td><td>{4:C}</td></tr>" +
                "</table>"
    },
    highlight: {
        opacity: 1,
        border: {
            width: 1,
            opacity: 1
        },
        line: {
            width: 1,
            opacity: 1
        }
    },
    notes: {
        visible: true,
        label: {}
    },
    outliers: {
        visible: true,
        size: LINE_MARKER_SIZE,
        type: CROSS,
        background: WHITE,
        border: {
            width: 2,
            opacity: 1
        },
        opacity: 0
    },
    extremes: {
        visible: true,
        size: LINE_MARKER_SIZE,
        type: CIRCLE,
        background: WHITE,
        border: {
            width: 2,
            opacity: 1
        },
        opacity: 0
    }
});

deepExtend(BoxPlot.prototype, PointEventsMixin);

export default BoxPlot;