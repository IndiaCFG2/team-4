import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box } from '../../core';
import Crosshair from '../crosshair/crosshair';
import Pane from '../pane';
import { hasValue } from '../utils';

import { WHITE, BLACK, X, Y, COORD_PRECISION, TOP, BOTTOM, LEFT, RIGHT, START, END } from '../../common/constants';
import { append, deepExtend, defined, getSpacing, getTemplate, inArray, isFunction, isString, limitValue, round, setDefaultOptions } from '../../common';

class PlotAreaBase extends ChartElement {
    constructor(series, options, chartService) {
        super(options);

        this.initFields(series, options);
        this.series = series;
        this.initSeries();
        this.charts = [];
        this.options.legend = this.options.legend || {};
        this.options.legend.items = [];
        this.axes = [];
        this.crosshairs = [];
        this.chartService = chartService;
        this.originalOptions = options;

        this.createPanes();
        this.render();
        this.createCrosshairs();
    }

    initFields() { }

    initSeries() {
        const series = this.series;

        for (let i = 0; i < series.length; i++) {
            series[i].index = i;
        }
    }

    createPanes() {
        const defaults = { title: { color: (this.options.title || {}).color } };
        const panes = [];
        const paneOptions = this.options.panes || [];
        const panesLength = Math.max(paneOptions.length, 1);

        function setTitle(options, defaults) {
            if (isString(options.title)) {
                options.title = {
                    text: options.title
                };
            }

            options.title = deepExtend({}, defaults.title, options.title);
        }

        for (let i = 0; i < panesLength; i++) {
            const options = paneOptions[i] || {};
            setTitle(options, defaults);

            const currentPane = new Pane(options);
            currentPane.paneIndex = i;

            panes.push(currentPane);
            this.append(currentPane);
        }

        this.panes = panes;
    }

    createCrosshairs(panes = this.panes) {
        for (let i = 0; i < panes.length; i++) {
            const pane = panes[i];
            for (let j = 0; j < pane.axes.length; j++) {
                const axis = pane.axes[j];
                if (axis.options.crosshair && axis.options.crosshair.visible) {
                    const currentCrosshair = new Crosshair(this.chartService, axis, axis.options.crosshair);

                    this.crosshairs.push(currentCrosshair);
                    pane.content.append(currentCrosshair);
                }
            }
        }
    }

    removeCrosshairs(pane) {
        const crosshairs = this.crosshairs;
        const axes = pane.axes;

        for (let i = crosshairs.length - 1; i >= 0; i--) {
            for (let j = 0; j < axes.length; j++) {
                if (crosshairs[i].axis === axes[j]) {
                    crosshairs.splice(i, 1);
                    break;
                }
            }
        }
    }

    hideCrosshairs() {
        const crosshairs = this.crosshairs;
        for (let idx = 0; idx < crosshairs.length; idx++) {
            crosshairs[idx].hide();
        }
    }

    findPane(name) {
        const panes = this.panes;
        let matchingPane;

        for (let i = 0; i < panes.length; i++) {
            if (panes[i].options.name === name) {
                matchingPane = panes[i];
                break;
            }
        }

        return matchingPane || panes[0];
    }

    findPointPane(point) {
        const panes = this.panes;
        let matchingPane;

        for (let i = 0; i < panes.length; i++) {
            if (panes[i].box.containsPoint(point)) {
                matchingPane = panes[i];
                break;
            }
        }

        return matchingPane;
    }

    appendAxis(axis) {
        const pane = this.findPane(axis.options.pane);

        pane.appendAxis(axis);
        this.axes.push(axis);
        axis.plotArea = this;
    }

    removeAxis(axisToRemove) {
        const filteredAxes = [];

        for (let i = 0; i < this.axes.length; i++) {
            const axis = this.axes[i];
            if (axisToRemove !== axis) {
                filteredAxes.push(axis);
            } else {
                axis.destroy();
            }
        }

        this.axes = filteredAxes;
    }

    appendChart(chart, pane) {
        this.charts.push(chart);
        if (pane) {
            pane.appendChart(chart);
        } else {
            this.append(chart);
        }
    }

    removeChart(chartToRemove) {
        const filteredCharts = [];

        for (let i = 0; i < this.charts.length; i++) {
            const chart = this.charts[i];
            if (chart !== chartToRemove) {
                filteredCharts.push(chart);
            } else {
                chart.destroy();
            }
        }

        this.charts = filteredCharts;
    }

    addToLegend(series) {
        const count = series.length;
        const legend = this.options.legend;
        const labels = legend.labels || {};
        const inactiveItems = legend.inactiveItems || {};
        const inactiveItemsLabels = inactiveItems.labels || {};
        const data = [];

        for (let i = 0; i < count; i++) {
            const currentSeries = series[i];
            const seriesVisible = currentSeries.visible !== false;
            if (currentSeries.visibleInLegend === false) {
                continue;
            }

            let text = currentSeries.name;
            const labelTemplate = seriesVisible ? getTemplate(labels) : getTemplate(inactiveItemsLabels) || getTemplate(labels);
            if (labelTemplate) {
                text = labelTemplate({
                    text: hasValue(text) ? text : "",
                    series: currentSeries
                });
            }

            const defaults = currentSeries._defaults;
            let color = currentSeries.color;
            if (isFunction(color) && defaults) {
                color = defaults.color;
            }

            let itemLabelOptions, markerColor;
            if (seriesVisible) {
                itemLabelOptions = {};
                markerColor = color;
            } else {
                itemLabelOptions = {
                    color: inactiveItemsLabels.color,
                    font: inactiveItemsLabels.font
                };
                markerColor = inactiveItems.markers.color;
            }

            if (hasValue(text) && text !== "") {
                data.push({
                    text: text,
                    labels: itemLabelOptions,
                    markerColor: markerColor,
                    series: currentSeries,
                    active: seriesVisible
                });
            }
        }

        append(legend.items, data);
    }

    groupAxes(panes) {
        const xAxes = [];
        const yAxes = [];

        for (let paneIx = 0; paneIx < panes.length; paneIx++) {
            const paneAxes = panes[paneIx].axes;
            for (let axisIx = 0; axisIx < paneAxes.length; axisIx++) {
                const axis = paneAxes[axisIx];
                if (axis.options.vertical) {
                    yAxes.push(axis);
                } else {
                    xAxes.push(axis);
                }
            }
        }

        return { x: xAxes, y: yAxes, any: xAxes.concat(yAxes) };
    }

    groupSeriesByPane() {
        const series = this.series;
        const seriesByPane = {};

        for (let i = 0; i < series.length; i++) {
            const currentSeries = series[i];
            const pane = this.seriesPaneName(currentSeries);

            if (seriesByPane[pane]) {
                seriesByPane[pane].push(currentSeries);
            } else {
                seriesByPane[pane] = [ currentSeries ];
            }
        }

        return seriesByPane;
    }

    filterVisibleSeries(series) {
        const result = [];

        for (let i = 0; i < series.length; i++) {
            const currentSeries = series[i];
            if (currentSeries.visible !== false) {
                result.push(currentSeries);
            }
        }

        return result;
    }

    reflow(targetBox) {
        const options = this.options.plotArea;
        const panes = this.panes;
        const margin = getSpacing(options.margin);

        this.box = targetBox.clone().unpad(margin);
        this.reflowPanes();

        this.detachLabels();
        this.reflowAxes(panes);
        this.reflowCharts(panes);
    }

    redraw(panes) {
        const panesArray = [].concat(panes);
        this.initSeries();

        //prevents leak during partial redraws. the cached gradients observers retain reference to the destroyed elements.
        const root = this.getRoot();
        if (root) {
            root.cleanGradients();
        }

        for (let i = 0; i < panesArray.length; i++) {
            this.removeCrosshairs(panesArray[i]);
            panesArray[i].empty();
        }

        this.render(panesArray);
        this.detachLabels();
        this.reflowAxes(this.panes);
        this.reflowCharts(panesArray);

        this.createCrosshairs(panesArray);

        for (let i = 0; i < panesArray.length; i++) {
            panesArray[i].refresh();
        }
    }

    axisCrossingValues(axis, crossingAxes) {
        const options = axis.options;
        const crossingValues = [].concat(
            options.axisCrossingValues || options.axisCrossingValue
        );
        const valuesToAdd = crossingAxes.length - crossingValues.length;
        const defaultValue = crossingValues[0] || 0;

        for (let i = 0; i < valuesToAdd; i++) {
            crossingValues.push(defaultValue);
        }

        return crossingValues;
    }

    alignAxisTo(axis, targetAxis, crossingValue, targetCrossingValue) {
        const slot = axis.getSlot(crossingValue, crossingValue, true);
        const slotEdge = axis.options.reverse ? 2 : 1;
        const targetSlot = targetAxis.getSlot(targetCrossingValue, targetCrossingValue, true);
        const targetEdge = targetAxis.options.reverse ? 2 : 1;
        const axisBox = axis.box.translate(
            targetSlot[X + targetEdge] - slot[X + slotEdge],
            targetSlot[Y + targetEdge] - slot[Y + slotEdge]
        );

        if (axis.pane !== targetAxis.pane) {
            axisBox.translate(0, axis.pane.box.y1 - targetAxis.pane.box.y1);
        }

        axis.reflow(axisBox);
    }

    alignAxes(xAxes, yAxes) {
        const xAnchor = xAxes[0];
        const yAnchor = yAxes[0];
        const xAnchorCrossings = this.axisCrossingValues(xAnchor, yAxes);
        const yAnchorCrossings = this.axisCrossingValues(yAnchor, xAxes);
        const leftAnchors = {};
        const rightAnchors = {};
        const topAnchors = {};
        const bottomAnchors = {};

        for (let i = 0; i < yAxes.length; i++) {
            const axis = yAxes[i];
            const pane = axis.pane;
            const paneId = pane.id;
            const visible = axis.options.visible !== false;

            // Locate pane anchor, if any, and use its axisCrossingValues
            const anchor = paneAnchor(xAxes, pane) || xAnchor;
            let anchorCrossings = xAnchorCrossings;

            if (anchor !== xAnchor) {
                anchorCrossings = this.axisCrossingValues(anchor, yAxes);
            }

            this.alignAxisTo(axis, anchor, yAnchorCrossings[i], anchorCrossings[i]);

            if (axis.options._overlap) {
                continue;
            }

            if (round(axis.lineBox().x1) === round(anchor.lineBox().x1)) {
                // Push the axis to the left the previous y-axis so they don't overlap
                if (leftAnchors[paneId]) {
                    axis.reflow(axis.box
                        .alignTo(leftAnchors[paneId].box, LEFT)
                        .translate(-axis.options.margin, 0)
                    );
                }

                if (visible) {
                    leftAnchors[paneId] = axis;
                }
            }

            if (round(axis.lineBox().x2) === round(anchor.lineBox().x2)) {
                // Flip the labels on the right if we're at the right end of the pane
                if (!axis._mirrored) {
                    axis.options.labels.mirror = !axis.options.labels.mirror;
                    axis._mirrored = true;
                }

                this.alignAxisTo(axis, anchor, yAnchorCrossings[i], anchorCrossings[i]);

                // Push the axis to the right the previous y-axis so they don't overlap
                if (rightAnchors[paneId]) {
                    axis.reflow(axis.box
                        .alignTo(rightAnchors[paneId].box, RIGHT)
                        .translate(axis.options.margin, 0)
                    );
                }

                if (visible) {
                    rightAnchors[paneId] = axis;
                }
            }

            if (i !== 0 && yAnchor.pane === axis.pane) {
                axis.alignTo(yAnchor);
                axis.reflow(axis.box);
            }
        }

        for (let i = 0; i < xAxes.length; i++) {
            const axis = xAxes[i];
            const pane = axis.pane;
            const paneId = pane.id;
            const visible = axis.options.visible !== false;

            // Locate pane anchor and use its axisCrossingValues
            const anchor = paneAnchor(yAxes, pane) || yAnchor;
            let anchorCrossings = yAnchorCrossings;
            if (anchor !== yAnchor) {
                anchorCrossings = this.axisCrossingValues(anchor, xAxes);
            }

            this.alignAxisTo(axis, anchor, xAnchorCrossings[i], anchorCrossings[i]);

            if (axis.options._overlap) {
                continue;
            }

            if (round(axis.lineBox().y1) === round(anchor.lineBox().y1)) {
                // Flip the labels on top if we're at the top of the pane
                if (!axis._mirrored) {
                    axis.options.labels.mirror = !axis.options.labels.mirror;
                    axis._mirrored = true;
                }
                this.alignAxisTo(axis, anchor, xAnchorCrossings[i], anchorCrossings[i]);

                // Push the axis above the previous x-axis so they don't overlap
                if (topAnchors[paneId]) {
                    axis.reflow(axis.box
                        .alignTo(topAnchors[paneId].box, TOP)
                        .translate(0, -axis.options.margin)
                    );
                }

                if (visible) {
                    topAnchors[paneId] = axis;
                }
            }

            if (round(axis.lineBox().y2, COORD_PRECISION) === round(anchor.lineBox().y2, COORD_PRECISION)) {
                // Push the axis below the previous x-axis so they don't overlap
                if (bottomAnchors[paneId]) {
                    axis.reflow(axis.box
                        .alignTo(bottomAnchors[paneId].box, BOTTOM)
                        .translate(0, axis.options.margin)
                    );
                }

                if (visible) {
                    bottomAnchors[paneId] = axis;
                }
            }

            if (i !== 0) {
                axis.alignTo(xAnchor);
                axis.reflow(axis.box);
            }
        }
    }

    shrinkAxisWidth(panes) {
        const axes = this.groupAxes(panes).any;
        const axisBox = axisGroupBox(axes);
        let overflowX = 0;

        for (let i = 0; i < panes.length; i++) {
            const currentPane = panes[i];

            if (currentPane.axes.length > 0) {
                overflowX = Math.max(
                    overflowX,
                    axisBox.width() - currentPane.contentBox.width()
                );
            }
        }

        if (overflowX !== 0) {
            for (let i = 0; i < axes.length; i++) {
                const currentAxis = axes[i];

                if (!currentAxis.options.vertical) {
                    currentAxis.reflow(currentAxis.box.shrink(overflowX, 0));
                }
            }
        }
    }

    shrinkAxisHeight(panes) {
        let shrinked;

        for (let i = 0; i < panes.length; i++) {
            const currentPane = panes[i];
            const axes = currentPane.axes;
            const overflowY = Math.max(0, axisGroupBox(axes).height() - currentPane.contentBox.height());

            if (overflowY !== 0) {
                for (let j = 0; j < axes.length; j++) {
                    const currentAxis = axes[j];

                    if (currentAxis.options.vertical) {
                        currentAxis.reflow(
                            currentAxis.box.shrink(0, overflowY)
                        );
                    }
                }
                shrinked = true;
            }
        }

        return shrinked;
    }

    fitAxes(panes) {
        const axes = this.groupAxes(panes).any;
        let offsetX = 0;

        for (let i = 0; i < panes.length; i++) {
            const currentPane = panes[i];
            const paneAxes = currentPane.axes;
            const paneBox = currentPane.contentBox;

            if (paneAxes.length > 0) {
                const axisBox = axisGroupBox(paneAxes);
                // OffsetY is calculated and applied per pane
                const offsetY = Math.max(paneBox.y1 - axisBox.y1, paneBox.y2 - axisBox.y2);

                // OffsetX is calculated and applied globally
                offsetX = Math.max(offsetX, paneBox.x1 - axisBox.x1);


                for (let j = 0; j < paneAxes.length; j++) {
                    const currentAxis = paneAxes[j];

                    currentAxis.reflow(
                        currentAxis.box.translate(0, offsetY)
                    );
                }
            }
        }

        for (let i = 0; i < axes.length; i++) {
            const currentAxis = axes[i];

            currentAxis.reflow(
                currentAxis.box.translate(offsetX, 0)
            );
        }
    }

    reflowAxes(panes) {
        const axes = this.groupAxes(panes);

        for (let i = 0; i < panes.length; i++) {
            this.reflowPaneAxes(panes[i]);
        }

        if (axes.x.length > 0 && axes.y.length > 0) {
            this.alignAxes(axes.x, axes.y);
            this.shrinkAxisWidth(panes);

            this.autoRotateAxisLabels(axes);

            this.alignAxes(axes.x, axes.y);
            if (this.shrinkAxisWidth(panes)) {
                this.alignAxes(axes.x, axes.y);
            }

            this.shrinkAxisHeight(panes);
            this.alignAxes(axes.x, axes.y);

            if (this.shrinkAxisHeight(panes)) {
                this.alignAxes(axes.x, axes.y);
            }

            this.fitAxes(panes);
        }
    }

    autoRotateAxisLabels(groupedAxes) {
        const { panes } = this;
        const axes = allPaneAxes(panes);
        let rotated;

        for (let idx = 0; idx < axes.length; idx++) {
            const axis = axes[idx];
            if (axis.autoRotateLabels()) {
                rotated = true;
            }
        }

        if (rotated) {
            for (let idx = 0; idx < panes.length; idx++) {
                this.reflowPaneAxes(panes[idx]);
            }

            if (groupedAxes.x.length > 0 && groupedAxes.y.length > 0) {
                this.alignAxes(groupedAxes.x, groupedAxes.y);
                this.shrinkAxisWidth(panes);
            }
        }
    }

    reflowPaneAxes(pane) {
        const axes = pane.axes;
        const length = axes.length;

        if (length > 0) {
            for (let i = 0; i < length; i++) {
                axes[i].reflow(pane.contentBox);
            }
        }
    }

    reflowCharts(panes) {
        const charts = this.charts;
        const count = charts.length;
        const box = this.box;

        for (let i = 0; i < count; i++) {
            const chartPane = charts[i].pane;
            if (!chartPane || inArray(chartPane, panes)) {
                charts[i].reflow(box);
            }
        }
    }

    reflowPanes() {
        const { box, panes } = this;
        const panesLength = panes.length;
        let remainingHeight = box.height();
        let remainingPanes = panesLength;
        let autoHeightPanes = 0;
        let top = box.y1;

        for (let i = 0; i < panesLength; i++) {
            const currentPane = panes[i];
            const height = currentPane.options.height;

            currentPane.options.width = box.width();

            if (!currentPane.options.height) {
                autoHeightPanes++;
            } else {
                if (height.indexOf && height.indexOf("%")) {
                    const percents = parseInt(height, 10) / 100;
                    currentPane.options.height = percents * box.height();
                }

                currentPane.reflow(box.clone());

                remainingHeight -= currentPane.options.height;
            }
        }

        for (let i = 0; i < panesLength; i++) {
            const currentPane = panes[i];

            if (!currentPane.options.height) {
                currentPane.options.height = remainingHeight / autoHeightPanes;
            }
        }

        for (let i = 0; i < panesLength; i++) {
            const currentPane = panes[i];
            const paneBox = box
                .clone()
                .move(box.x1, top);

            currentPane.reflow(paneBox);

            remainingPanes--;
            top += currentPane.options.height;
        }
    }

    backgroundBox() {
        const axes = this.axes;
        const axesCount = axes.length;
        let box;

        for (let i = 0; i < axesCount; i++) {
            const axisA = axes[i];

            for (let j = 0; j < axesCount; j++) {
                const axisB = axes[j];

                if (axisA.options.vertical !== axisB.options.vertical) {
                    const lineBox = axisA.lineBox().clone().wrap(axisB.lineBox());

                    if (!box) {
                        box = lineBox;
                    } else {
                        box = box.wrap(lineBox);
                    }
                }
            }
        }

        return box || this.box;
    }

    chartsBoxes() {
        const panes = this.panes;
        const boxes = [];

        for (let idx = 0; idx < panes.length; idx++) {
            boxes.push(panes[idx].chartsBox());
        }

        return boxes;
    }

    addBackgroundPaths(multipath) {
        const boxes = this.chartsBoxes();
        for (let idx = 0; idx < boxes.length; idx++) {
            multipath.paths.push(draw.Path.fromRect(boxes[idx].toRect()));
        }
    }

    backgroundContainsPoint(point) {
        const boxes = this.chartsBoxes();
        for (let idx = 0; idx < boxes.length; idx++) {
            if (boxes[idx].containsPoint(point)) {
                return true;
            }
        }
    }

    createVisual() {
        super.createVisual();

        const options = this.options.plotArea;
        let { opacity, background, border = {} } = options;
        if (isTransparent(background)) {
            background = WHITE;
            opacity = 0;
        }

        const bg = this._bgVisual = new draw.MultiPath({
            fill: {
                color: background,
                opacity: opacity
            },
            stroke: {
                color: border.width ? border.color : "",
                width: border.width,
                dashType: border.dashType
            },
            zIndex: -1
        });

        this.addBackgroundPaths(bg);

        this.appendVisual(bg);
    }

    pointsByCategoryIndex(categoryIndex) {
        const charts = this.charts;
        const result = [];

        if (categoryIndex !== null) {
            for (let i = 0; i < charts.length; i++) {
                const chart = charts[i];
                if (chart.pane.options.name === "_navigator") {
                    continue;
                }

                const points = charts[i].categoryPoints[categoryIndex];
                if (points && points.length) {
                    for (let j = 0; j < points.length; j++) {
                        const point = points[j];
                        if (point && defined(point.value) && point.value !== null) {
                            result.push(point);
                        }
                    }
                }
            }
        }

        return result;
    }

    pointsBySeriesIndex(seriesIndex) {
        return this.filterPoints(function(point) {
            return point.series.index === seriesIndex;
        });
    }

    pointsBySeriesName(name) {
        return this.filterPoints(function(point) {
            return point.series.name === name;
        });
    }

    filterPoints(callback) {
        const charts = this.charts;
        const result = [];

        for (let i = 0; i < charts.length; i++) {
            const chart = charts[i];
            const points = chart.points;
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                if (point && point.visible !== false && callback(point)) {
                    result.push(point);
                }
            }
        }

        return result;
    }

    findPoint(callback) {
        const charts = this.charts;

        for (let i = 0; i < charts.length; i++) {
            const chart = charts[i];
            const points = chart.points;
            for (let j = 0; j < points.length; j++) {
                const point = points[j];
                if (point && point.visible !== false && callback(point)) {
                    return point;
                }
            }
        }
    }

    paneByPoint(point) {
        const panes = this.panes;

        for (let i = 0; i < panes.length; i++) {
            const pane = panes[i];
            if (pane.box.containsPoint(point)) {
                return pane;
            }
        }
    }

    detachLabels() {
        const axes = this.groupAxes(this.panes);
        const xAxes = axes.x;
        const yAxes = axes.y;

        this.detachAxisGroupLabels(yAxes, xAxes);
        this.detachAxisGroupLabels(xAxes, yAxes);
    }

    detachAxisGroupLabels(axes, crossingAxes) {
        let labelAxisCount = 0;

        for (let i = 0; i < axes.length; i++) {
            const axis = axes[i];
            const pane = axis.pane;
            const anchor = paneAnchor(crossingAxes, pane) || crossingAxes[0];
            const axisIndex = i + labelAxisCount;
            const labelAxis = this.createLabelAxis(axis, axisIndex, anchor);

            if (labelAxis) {
                labelAxisCount++;

                const pos = pane.axes.indexOf(axis) + labelAxisCount;
                pane.appendAxisAt(labelAxis, pos);
            }
        }
    }

    createLabelAxis(axis, axisIndex, anchor) {
        const labelOptions = axis.options.labels;
        const position = labelOptions.position;
        const onAxis = position !== END && position !== START;
        const visible = labelOptions.visible;

        if (onAxis || visible === false) {
            return null;
        }

        const allAxes = this.groupAxes(this.panes);
        const crossingAxes = anchor.options.vertical ? allAxes.x : allAxes.y;
        const anchorCrossings = this.axisCrossingValues(anchor, crossingAxes);
        const end = position === END;
        const range = anchor.range();
        const edge = end ? range.max : range.min;
        const crossingValue = limitValue(anchorCrossings[axisIndex], range.min, range.max);

        if (crossingValue - edge === 0) {
            return null;
        }

        anchorCrossings.splice(axisIndex + 1, 0, edge);
        anchor.options.axisCrossingValues = anchorCrossings;

        const labelAxis = axis.clone();
        axis.clear();

        labelAxis.options.name = undefined;
        labelAxis.options.line.visible = false;

        labelAxis.options.crosshair = undefined;
        labelAxis.options.notes = undefined;
        labelAxis.options.plotBands = undefined;

        return labelAxis;
    }
}

function isSingleAxis(axis) {
    return !axis.pane.axes.some((a) =>
        a.options.vertical === axis.options.vertical && a !== axis && a.options.visible !== false
    );
}

function axisGroupBox(axes) {
    const length = axes.length;
    let box;

    for (let i = 0; i < length; i++) {
        const axis = axes[i];
        const visible = axis.options.visible !== false;
        if (visible || isSingleAxis(axis)) {
            const axisBox = visible ? axis.contentBox() : axis.lineBox();

            if (!box) {
                box = axisBox.clone();
            } else {
                box.wrap(axisBox);
            }
        }
    }

    return box || new Box();
}

function paneAnchor(axes, pane) {
    for (let i = 0; i < axes.length; i++) {
        const anchor = axes[i];
        if (anchor && anchor.pane === pane) {
            return anchor;
        }
    }
}

function isTransparent(color) {
    return color === "" || color === null || color === "none" || color === "transparent" || !defined(color);
}

const allPaneAxes = (panes) => panes.reduce((acc, pane) => acc.concat(pane.axes), []);

setDefaultOptions(PlotAreaBase, {
    series: [],
    plotArea: {
        margin: {}
    },
    background: "",
    border: {
        color: BLACK,
        width: 0
    },
    legend: {
        inactiveItems: {
            labels: {
                color: "#919191"
            },
            markers: {
                color: "#919191"
            }
        }
    }
});

export default PlotAreaBase;
