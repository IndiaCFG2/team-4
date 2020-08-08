
import { ChartElement, BoxElement, Box } from '../../core';
import LegendLayout from './legend-layout';
import LegendItem from './legend-item';

import { TOP, RIGHT, BOTTOM, LEFT, CENTER, X, Y, BLACK } from '../../common/constants';
import { deepExtend, defined, getSpacing, inArray, setDefaultOptions } from '../../common';

var HORIZONTAL = "horizontal";
var POINTER = "pointer";
var CUSTOM = "custom";

var Legend = (function (ChartElement) {
    function Legend(options, chartService) {
        if ( chartService === void 0 ) chartService = {};

        ChartElement.call(this, options);

        this.chartService = chartService;

        if (!inArray(this.options.position, [ TOP, RIGHT, BOTTOM, LEFT, CUSTOM ])) {
            this.options.position = RIGHT;
        }

        this.createContainer();

        this.createItems();
    }

    if ( ChartElement ) Legend.__proto__ = ChartElement;
    Legend.prototype = Object.create( ChartElement && ChartElement.prototype );
    Legend.prototype.constructor = Legend;

    Legend.prototype.createContainer = function createContainer () {
        var options = this.options;
        var position = options.position;
        var userAlign = options.align;
        var align = position;
        var vAlign = CENTER;

        if (position === CUSTOM) {
            align = LEFT;
        } else if (inArray(position, [ TOP, BOTTOM ])) {
            if (userAlign === "start") {
                align = LEFT;
            } else if (userAlign === "end") {
                align = RIGHT;
            } else {
                align = CENTER;
            }
            vAlign = position;
        } else if (userAlign) {
            if (userAlign === "start") {
                vAlign = TOP;
            } else if (userAlign === "end") {
                vAlign = BOTTOM;
            }
        }

        this.container = new BoxElement({
            margin: options.margin,
            padding: options.padding,
            background: options.background,
            border: options.border,
            vAlign: vAlign,
            align: align,
            zIndex: options.zIndex,
            shrinkToFit: true
        });

        this.append(this.container);
    };

    Legend.prototype.createItems = function createItems () {
        var chartService = this.getService();
        var options = this.options;
        var vertical = this.isVertical();
        var innerElement = new LegendLayout({
            vertical: vertical,
            spacing: options.spacing,
            rtl: chartService.rtl
        }, chartService);
        var items = options.items;

        if (options.reverse) {
            items = items.slice(0).reverse();
        }

        var count = items.length;

        for (var i = 0; i < count; i++) {
            var item = items[i];

            innerElement.append(new LegendItem(deepExtend({}, {
                markers: options.markers,
                labels: options.labels,
                rtl: chartService.rtl
            }, options.item, item)));
        }

        innerElement.render();

        this.container.append(innerElement);
    };

    Legend.prototype.isVertical = function isVertical () {
        var ref = this.options;
        var orientation = ref.orientation;
        var position = ref.position;
        var vertical = (position === CUSTOM && orientation !== HORIZONTAL) ||
               (defined(orientation) ? orientation !== HORIZONTAL : inArray(position, [ LEFT, RIGHT ]));

        return vertical;
    };

    Legend.prototype.hasItems = function hasItems () {
        return this.container.children[0].children.length > 0;
    };

    Legend.prototype.reflow = function reflow (targetBox) {
        var options = this.options;
        var legendBox = targetBox.clone();

        if (!this.hasItems()) {
            this.box = legendBox;
            return;
        }

        if (options.position === CUSTOM) {
            this.containerCustomReflow(legendBox);
            this.box = legendBox;
        } else {
            this.containerReflow(legendBox);
        }
    };

    Legend.prototype.containerReflow = function containerReflow (targetBox) {
        var ref = this;
        var options = ref.options;
        var container = ref.container;
        var position = options.position;
        var width = options.width;
        var height = options.height;
        var pos = position === TOP || position === BOTTOM ? X : Y;
        var vertical = this.isVertical();
        var alignTarget = targetBox.clone();
        var containerBox = targetBox.clone();

        if (position === LEFT || position === RIGHT) {
            containerBox.y1 = alignTarget.y1 = 0;
        }

        if (vertical && height) {
            containerBox.y2 = containerBox.y1 + height;
            containerBox.align(alignTarget, Y, container.options.vAlign);
        } else if (!vertical && width) {
            containerBox.x2 = containerBox.x1 + width;
            containerBox.align(alignTarget, X, container.options.align);
        }

        container.reflow(containerBox);
        containerBox = container.box;

        var box = containerBox.clone();

        if (options.offsetX || options.offsetY) {
            containerBox.translate(options.offsetX, options.offsetY);
            this.container.reflow(containerBox);
        }

        box[pos + 1] = targetBox[pos + 1];
        box[pos + 2] = targetBox[pos + 2];

        this.box = box;
    };

    Legend.prototype.containerCustomReflow = function containerCustomReflow (targetBox) {
        var ref = this;
        var options = ref.options;
        var container = ref.container;
        var offsetX = options.offsetX;
        var offsetY = options.offsetY;
        var width = options.width;
        var height = options.height;
        var vertical = this.isVertical();
        var containerBox = targetBox.clone();

        if (vertical && height) {
            containerBox.y2 = containerBox.y1 + height;
        } else if (!vertical && width) {
            containerBox.x2 = containerBox.x1 + width;
        }
        container.reflow(containerBox);
        containerBox = container.box;

        container.reflow(new Box(
            offsetX, offsetY,
            offsetX + containerBox.width(), offsetY + containerBox.height()
        ));
    };

    Legend.prototype.renderVisual = function renderVisual () {
        if (this.hasItems()) {
            ChartElement.prototype.renderVisual.call(this);
        }
    };

    return Legend;
}(ChartElement));

setDefaultOptions(Legend, {
    position: RIGHT,
    items: [],
    offsetX: 0,
    offsetY: 0,
    margin: getSpacing(5),
    padding: getSpacing(5),
    border: {
        color: BLACK,
        width: 0
    },
    item: {
        cursor: POINTER,
        spacing: 6
    },
    spacing: 6,
    background: "",
    zIndex: 1,
    markers: {
        border: {
            width: 0
        },
        width: 15,
        height: 3,
        type: "rect",
        align: LEFT,
        vAlign: CENTER
    }
});

export default Legend;