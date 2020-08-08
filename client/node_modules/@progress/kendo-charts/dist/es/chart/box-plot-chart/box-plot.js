import { Color } from '@progress/kendo-drawing';

import Candlestick from '../candlestick-chart/candlestick';
import PointEventsMixin from '../mixins/point-events-mixin';
import { ShapeElement } from '../../core';

import { LINE_MARKER_SIZE, BORDER_BRIGHTNESS } from '../constants';

import { CROSS, CIRCLE, WHITE } from '../../common/constants';
import { deepExtend, defined, setDefaultOptions } from '../../common';

var BoxPlot = (function (Candlestick) {
    function BoxPlot(value, options) {
        Candlestick.call(this, value, options);

        this.createNote();
    }

    if ( Candlestick ) BoxPlot.__proto__ = Candlestick;
    BoxPlot.prototype = Object.create( Candlestick && Candlestick.prototype );
    BoxPlot.prototype.constructor = BoxPlot;

    BoxPlot.prototype.reflow = function reflow (box) {
        var ref = this;
        var options = ref.options;
        var value = ref.value;
        var chart = ref.owner;
        var valueAxis = chart.seriesValueAxis(options);
        var whiskerSlot, boxSlot;

        this.boxSlot = boxSlot = valueAxis.getSlot(value.q1, value.q3);
        this.realBody = boxSlot;
        this.reflowBoxSlot(box);

        this.whiskerSlot = whiskerSlot = valueAxis.getSlot(value.lower, value.upper);
        this.reflowWhiskerSlot(box);

        var medianSlot = valueAxis.getSlot(value.median);

        if (value.mean) {
            var meanSlot = valueAxis.getSlot(value.mean);
            this.meanPoints = this.calcMeanPoints(box, meanSlot);
        }

        this.whiskerPoints = this.calcWhiskerPoints(boxSlot, whiskerSlot);
        this.medianPoints = this.calcMedianPoints(box, medianSlot);

        this.box = whiskerSlot.clone().wrap(boxSlot);
        this.reflowNote();
    };

    BoxPlot.prototype.reflowBoxSlot = function reflowBoxSlot (box) {
        this.boxSlot.x1 = box.x1;
        this.boxSlot.x2 = box.x2;
    };

    BoxPlot.prototype.reflowWhiskerSlot = function reflowWhiskerSlot (box) {
        this.whiskerSlot.x1 = box.x1;
        this.whiskerSlot.x2 = box.x2;
    };

    BoxPlot.prototype.calcMeanPoints = function calcMeanPoints (box, meanSlot) {
        return [
            [ [ box.x1, meanSlot.y1 ], [ box.x2, meanSlot.y1 ] ]
        ];
    };

    BoxPlot.prototype.calcWhiskerPoints = function calcWhiskerPoints (boxSlot, whiskerSlot) {
        var mid = whiskerSlot.center().x;
        return [ [
            [ mid - 5, whiskerSlot.y1 ], [ mid + 5, whiskerSlot.y1 ],
            [ mid, whiskerSlot.y1 ], [ mid, boxSlot.y1 ]
        ], [
            [ mid - 5, whiskerSlot.y2 ], [ mid + 5, whiskerSlot.y2 ],
            [ mid, whiskerSlot.y2 ], [ mid, boxSlot.y2 ]
        ] ];
    };

    BoxPlot.prototype.calcMedianPoints = function calcMedianPoints (box, medianSlot) {
        return [
            [ [ box.x1, medianSlot.y1 ], [ box.x2, medianSlot.y1 ] ]
        ];
    };

    BoxPlot.prototype.renderOutliers = function renderOutliers (options) {
        var this$1 = this;

        var value = this.value;
        var outliers = value.outliers || [];
        var outerFence = Math.abs(value.q3 - value.q1) * 3;
        var elements = [];
        var markers = options.markers || {};

        for (var i = 0; i < outliers.length; i++) {
            var outlierValue = outliers[i];
            if (outlierValue < value.q3 + outerFence && outlierValue > value.q1 - outerFence) {
                markers = options.outliers;
            } else {
                markers = options.extremes;
            }
            var markersBorder = deepExtend({}, markers.border);

            if (!defined(markersBorder.color)) {
                if (defined(this$1.color)) {
                    markersBorder.color = this$1.color;
                } else {
                    markersBorder.color =
                        new Color(markers.background).brightness(BORDER_BRIGHTNESS).toHex();
                }
            }

            var shape = new ShapeElement({
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
    };

    BoxPlot.prototype.reflowOutliers = function reflowOutliers (outliers) {
        var this$1 = this;

        var valueAxis = this.owner.seriesValueAxis(this.options);
        var center = this.box.center();

        for (var i = 0; i < outliers.length; i++) {
            var outlierValue = outliers[i].value;
            var markerBox = valueAxis.getSlot(outlierValue);

            if (this$1.options.vertical) {
                markerBox.move(center.x);
            } else {
                markerBox.move(undefined, center.y);
            }

            this$1.box = this$1.box.wrap(markerBox);
            outliers[i].reflow(markerBox);
        }
    };

    BoxPlot.prototype.mainVisual = function mainVisual (options) {
        var group = Candlestick.prototype.mainVisual.call(this, options);
        var outliers = this.renderOutliers(options);

        for (var i = 0; i < outliers.length; i++) {
            var element = outliers[i].getElement();
            if (element) {
                group.append(element);
            }
        }

        return group;
    };

    BoxPlot.prototype.createLines = function createLines (container, options) {
        this.drawLines(container, options, this.whiskerPoints, options.whiskers);
        this.drawLines(container, options, this.medianPoints, options.median);
        this.drawLines(container, options, this.meanPoints, options.mean);
    };

    BoxPlot.prototype.getBorderColor = function getBorderColor () {
        if ((this.options.border || {}).color) {
            return this.options.border.color;
        }

        if (this.color) {
            return this.color;
        }

        return Candlestick.prototype.getBorderColor.call(this);
    };

    return BoxPlot;
}(Candlestick));

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