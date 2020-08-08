import { ChartElement, BoxElement, Title, Box } from '../core';
import { ChartPane } from './api-elements';
import ChartContainer from './chart-container';

import { PANE_RENDER } from './constants';
import { TOP, LEFT, X, Y } from '../common/constants';
import { append, deepExtend, isObject, last, setDefaultOptions } from '../common';

var Pane = (function (BoxElement) {
    function Pane(options) {
        BoxElement.call(this, options);

        this.id = paneID();

        this.createTitle();

        this.content = new ChartElement();

        this.chartContainer = new ChartContainer({}, this);
        this.append(this.content);

        this.axes = [];
        this.charts = [];
    }

    if ( BoxElement ) Pane.__proto__ = BoxElement;
    Pane.prototype = Object.create( BoxElement && BoxElement.prototype );
    Pane.prototype.constructor = Pane;

    Pane.prototype.createTitle = function createTitle () {
        var titleOptions = this.options.title;
        if (isObject(titleOptions)) {
            titleOptions = deepExtend({}, titleOptions, {
                align: titleOptions.position,
                position: TOP
            });
        }

        this.title = Title.buildTitle(titleOptions, this, Pane.prototype.options.title);
    };

    Pane.prototype.appendAxis = function appendAxis (axis) {
        this.content.append(axis);
        this.axes.push(axis);
        axis.pane = this;
    };

    Pane.prototype.appendAxisAt = function appendAxisAt (axis, pos) {
        this.content.append(axis);
        this.axes.splice(pos, 0, axis);
        axis.pane = this;
    };

    Pane.prototype.appendChart = function appendChart (chart) {
        if (this.chartContainer.parent !== this.content) {
            this.content.append(this.chartContainer);
        }

        this.charts.push(chart);
        this.chartContainer.append(chart);
        chart.pane = this;
    };

    Pane.prototype.empty = function empty () {
        var this$1 = this;

        var plotArea = this.parent;

        if (plotArea) {
            for (var i = 0; i < this.axes.length; i++) {
                plotArea.removeAxis(this$1.axes[i]);
            }

            for (var i$1 = 0; i$1 < this.charts.length; i$1++) {
                plotArea.removeChart(this$1.charts[i$1]);
            }
        }

        this.axes = [];
        this.charts = [];

        this.content.destroy();
        this.content.children = [];
        this.chartContainer.children = [];
    };

    Pane.prototype.reflow = function reflow (targetBox) {
        // Content (such as charts) is rendered, but excluded from reflows
        var content;
        if (last(this.children) === this.content) {
            content = this.children.pop();
        }

        BoxElement.prototype.reflow.call(this, targetBox);

        if (content) {
            this.children.push(content);
        }

        if (this.title) {
            this.contentBox.y1 += this.title.box.height();
        }
    };

    Pane.prototype.visualStyle = function visualStyle () {
        var style = BoxElement.prototype.visualStyle.call(this);
        style.zIndex = -10;

        return style;
    };

    Pane.prototype.renderComplete = function renderComplete () {
        if (this.options.visible) {
            this.createGridLines();
        }
    };

    Pane.prototype.stackRoot = function stackRoot () {
        return this;
    };

    Pane.prototype.clipRoot = function clipRoot () {
        return this;
    };

    Pane.prototype.createGridLines = function createGridLines () {
        var axes = this.axes;
        var allAxes = axes.concat(this.parent.axes);
        var vGridLines = [];
        var hGridLines = [];

        // TODO
        // Is full combination really necessary?
        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i];
            var vertical = axis.options.vertical;
            var gridLines = vertical ? vGridLines : hGridLines;
            for (var j = 0; j < allAxes.length; j++) {
                if (gridLines.length === 0) {
                    var altAxis = allAxes[j];
                    if (vertical !== altAxis.options.vertical) {
                        append(gridLines, axis.createGridLines(altAxis));
                    }
                }
            }
        }
    };

    Pane.prototype.refresh = function refresh () {
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
    };

    Pane.prototype.chartsBox = function chartsBox () {
        var axes = this.axes;
        var length = axes.length;
        var chartsBox = new Box();

        for (var idx = 0; idx < length; idx++) {
            var axis = axes[idx];
            var axisValueField = axis.options.vertical ? Y : X;
            var lineBox = axis.lineBox();
            chartsBox[axisValueField + 1] = lineBox[axisValueField + 1];
            chartsBox[axisValueField + 2] = lineBox[axisValueField + 2];
        }

        if (chartsBox.x2 === 0) {
            var allAxes = this.parent.axes;
            var length$1 = allAxes.length;

            for (var idx$1 = 0; idx$1 < length$1; idx$1++) {
                var axis$1 = allAxes[idx$1];
                if (!axis$1.options.vertical) {
                    var lineBox$1 = axis$1.lineBox();
                    chartsBox.x1 = lineBox$1.x1;
                    chartsBox.x2 = lineBox$1.x2;
                }
            }
        }
        return chartsBox;
    };

    Pane.prototype.clipBox = function clipBox () {
        return this.chartContainer.clipBox;
    };

    Pane.prototype.notifyRender = function notifyRender () {
        var service = this.getService();
        if (service) {
            service.notify(PANE_RENDER, {
                pane: new ChartPane(this),
                index: this.paneIndex,
                name: this.options.name
            });
        }
    };

    return Pane;
}(BoxElement));

var ID = 1;

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
