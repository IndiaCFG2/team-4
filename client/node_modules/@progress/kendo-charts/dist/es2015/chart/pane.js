import { ChartElement, BoxElement, Title, Box } from '../core';
import { ChartPane } from './api-elements';
import ChartContainer from './chart-container';

import { PANE_RENDER } from './constants';
import { TOP, LEFT, X, Y } from '../common/constants';
import { append, deepExtend, isObject, last, setDefaultOptions } from '../common';

class Pane extends BoxElement {
    constructor(options) {
        super(options);

        this.id = paneID();

        this.createTitle();

        this.content = new ChartElement();

        this.chartContainer = new ChartContainer({}, this);
        this.append(this.content);

        this.axes = [];
        this.charts = [];
    }

    createTitle() {
        let titleOptions = this.options.title;
        if (isObject(titleOptions)) {
            titleOptions = deepExtend({}, titleOptions, {
                align: titleOptions.position,
                position: TOP
            });
        }

        this.title = Title.buildTitle(titleOptions, this, Pane.prototype.options.title);
    }

    appendAxis(axis) {
        this.content.append(axis);
        this.axes.push(axis);
        axis.pane = this;
    }

    appendAxisAt(axis, pos) {
        this.content.append(axis);
        this.axes.splice(pos, 0, axis);
        axis.pane = this;
    }

    appendChart(chart) {
        if (this.chartContainer.parent !== this.content) {
            this.content.append(this.chartContainer);
        }

        this.charts.push(chart);
        this.chartContainer.append(chart);
        chart.pane = this;
    }

    empty() {
        const plotArea = this.parent;

        if (plotArea) {
            for (let i = 0; i < this.axes.length; i++) {
                plotArea.removeAxis(this.axes[i]);
            }

            for (let i = 0; i < this.charts.length; i++) {
                plotArea.removeChart(this.charts[i]);
            }
        }

        this.axes = [];
        this.charts = [];

        this.content.destroy();
        this.content.children = [];
        this.chartContainer.children = [];
    }

    reflow(targetBox) {
        // Content (such as charts) is rendered, but excluded from reflows
        let content;
        if (last(this.children) === this.content) {
            content = this.children.pop();
        }

        super.reflow(targetBox);

        if (content) {
            this.children.push(content);
        }

        if (this.title) {
            this.contentBox.y1 += this.title.box.height();
        }
    }

    visualStyle() {
        const style = super.visualStyle();
        style.zIndex = -10;

        return style;
    }

    renderComplete() {
        if (this.options.visible) {
            this.createGridLines();
        }
    }

    stackRoot() {
        return this;
    }

    clipRoot() {
        return this;
    }

    createGridLines() {
        const axes = this.axes;
        const allAxes = axes.concat(this.parent.axes);
        const vGridLines = [];
        const hGridLines = [];

        // TODO
        // Is full combination really necessary?
        for (let i = 0; i < axes.length; i++) {
            const axis = axes[i];
            const vertical = axis.options.vertical;
            const gridLines = vertical ? vGridLines : hGridLines;
            for (let j = 0; j < allAxes.length; j++) {
                if (gridLines.length === 0) {
                    const altAxis = allAxes[j];
                    if (vertical !== altAxis.options.vertical) {
                        append(gridLines, axis.createGridLines(altAxis));
                    }
                }
            }
        }
    }

    refresh() {
        this.visual.clear();

        this.content.parent = null;
        this.content.createGradient = this.createGradient.bind(this);
        this.content.renderVisual();
        this.content.parent = this;

        if (this.title) {
            this.visual.append(this.title.visual);
        }

        this.visual.append(this.content.visual);

        this.renderComplete();
        this.notifyRender();
    }

    chartsBox() {
        const axes = this.axes;
        const length = axes.length;
        const chartsBox = new Box();

        for (let idx = 0; idx < length; idx++) {
            const axis = axes[idx];
            const axisValueField = axis.options.vertical ? Y : X;
            const lineBox = axis.lineBox();
            chartsBox[axisValueField + 1] = lineBox[axisValueField + 1];
            chartsBox[axisValueField + 2] = lineBox[axisValueField + 2];
        }

        if (chartsBox.x2 === 0) {
            const allAxes = this.parent.axes;
            const length = allAxes.length;

            for (let idx = 0; idx < length; idx++) {
                const axis = allAxes[idx];
                if (!axis.options.vertical) {
                    const lineBox = axis.lineBox();
                    chartsBox.x1 = lineBox.x1;
                    chartsBox.x2 = lineBox.x2;
                }
            }
        }
        return chartsBox;
    }

    clipBox() {
        return this.chartContainer.clipBox;
    }

    notifyRender() {
        const service = this.getService();
        if (service) {
            service.notify(PANE_RENDER, {
                pane: new ChartPane(this),
                index: this.paneIndex,
                name: this.options.name
            });
        }
    }
}

let ID = 1;

function paneID() {
    return "pane" + ID++;
}

Pane.prototype.isStackRoot = true;

setDefaultOptions(Pane, {
    zIndex: -1,
    shrinkToFit: true,
    title: {
        align: LEFT
    },
    visible: true
});

export default Pane;
