
import { ChartElement, BoxElement, Box } from '../../core';
import LegendLayout from './legend-layout';
import LegendItem from './legend-item';

import { TOP, RIGHT, BOTTOM, LEFT, CENTER, X, Y, BLACK } from '../../common/constants';
import { deepExtend, defined, getSpacing, inArray, setDefaultOptions } from '../../common';

const HORIZONTAL = "horizontal";
const POINTER = "pointer";
const CUSTOM = "custom";

class Legend extends ChartElement {
    constructor(options, chartService = {}) {
        super(options);

        this.chartService = chartService;

        if (!inArray(this.options.position, [ TOP, RIGHT, BOTTOM, LEFT, CUSTOM ])) {
            this.options.position = RIGHT;
        }

        this.createContainer();

        this.createItems();
    }

    createContainer() {
        const options = this.options;
        const { position, align: userAlign } = options;
        let align = position;
        let vAlign = CENTER;

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
    }

    createItems() {
        const chartService = this.getService();
        const options = this.options;
        const vertical = this.isVertical();
        const innerElement = new LegendLayout({
            vertical: vertical,
            spacing: options.spacing,
            rtl: chartService.rtl
        }, chartService);
        let items = options.items;

        if (options.reverse) {
            items = items.slice(0).reverse();
        }

        const count = items.length;

        for (let i = 0; i < count; i++) {
            let item = items[i];

            innerElement.append(new LegendItem(deepExtend({}, {
                markers: options.markers,
                labels: options.labels,
                rtl: chartService.rtl
            }, options.item, item)));
        }

        innerElement.render();

        this.container.append(innerElement);
    }

    isVertical() {
        const { orientation, position } = this.options;
        const vertical = (position === CUSTOM && orientation !== HORIZONTAL) ||
               (defined(orientation) ? orientation !== HORIZONTAL : inArray(position, [ LEFT, RIGHT ]));

        return vertical;
    }

    hasItems() {
        return this.container.children[0].children.length > 0;
    }

    reflow(targetBox) {
        const options = this.options;
        const legendBox = targetBox.clone();

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
    }

    containerReflow(targetBox) {
        const { options, container } = this;
        const { position, width, height } = options;
        const pos = position === TOP || position === BOTTOM ? X : Y;
        const vertical = this.isVertical();
        const alignTarget = targetBox.clone();
        let containerBox = targetBox.clone();

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

        const box = containerBox.clone();

        if (options.offsetX || options.offsetY) {
            containerBox.translate(options.offsetX, options.offsetY);
            this.container.reflow(containerBox);
        }

        box[pos + 1] = targetBox[pos + 1];
        box[pos + 2] = targetBox[pos + 2];

        this.box = box;
    }

    containerCustomReflow(targetBox) {
        const { options, container } = this;
        const { offsetX, offsetY, width, height } = options;
        const vertical = this.isVertical();
        let containerBox = targetBox.clone();

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
    }

    renderVisual() {
        if (this.hasItems()) {
            super.renderVisual();
        }
    }
}

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