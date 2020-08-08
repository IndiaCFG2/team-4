import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box } from '../../core';
import Crosshair from '../crosshair/crosshair';
import Pane from '../pane';
import { hasValue } from '../utils';

import { WHITE, BLACK, X, Y, COORD_PRECISION, TOP, BOTTOM, LEFT, RIGHT, START, END } from '../../common/constants';
import { append, deepExtend, defined, getSpacing, getTemplate, inArray, isFunction, isString, limitValue, round, setDefaultOptions } from '../../common';

var PlotAreaBase = (function (ChartElement) {
    function PlotAreaBase(series, options, chartService) {
        ChartElement.call(this, options);

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

    if ( ChartElement ) PlotAreaBase.__proto__ = ChartElement;
    PlotAreaBase.prototype = Object.create( ChartElement && ChartElement.prototype );
    PlotAreaBase.prototype.constructor = PlotAreaBase;

    PlotAreaBase.prototype.initFields = function initFields () { };

    PlotAreaBase.prototype.initSeries = function initSeries () {
        var series = this.series;

        for (var i = 0; i < series.length; i++) {
            series[i].index = i;
        }
    };

    PlotAreaBase.prototype.createPanes = function createPanes () {
        var this$1 = this;

        var defaults = { title: { color: (this.options.title || {}).color } };
        var panes = [];
        var paneOptions = this.options.panes || [];
        var panesLength = Math.max(paneOptions.length, 1);

        function setTitle(options, defaults) {
            if (isString(options.title)) {
                options.title = {
                    text: options.title
                };
            }

            options.title = deepExtend({}, defaults.title, options.title);
        }

        for (var i = 0; i < panesLength; i++) {
            var options = paneOptions[i] || {};
            setTitle(options, defaults);

            var currentPane = new Pane(options);
            currentPane.paneIndex = i;

            panes.push(currentPane);
            this$1.append(currentPane);
        }

        this.panes = panes;
    };

    PlotAreaBase.prototype.createCrosshairs = function createCrosshairs (panes) {
        var this$1 = this;
        if ( panes === void 0 ) panes = this.panes;

        for (var i = 0; i < panes.length; i++) {
            var pane = panes[i];
            for (var j = 0; j < pane.axes.length; j++) {
                var axis = pane.axes[j];
                if (axis.options.crosshair && axis.options.crosshair.visible) {
                    var currentCrosshair = new Crosshair(this$1.chartService, axis, axis.options.crosshair);

                    this$1.crosshairs.push(currentCrosshair);
                    pane.content.append(currentCrosshair);
                }
            }
        }
    };

    PlotAreaBase.prototype.removeCrosshairs = function removeCrosshairs (pane) {
        var crosshairs = this.crosshairs;
        var axes = pane.axes;

        for (var i = crosshairs.length - 1; i >= 0; i--) {
            for (var j = 0; j < axes.length; j++) {
                if (crosshairs[i].axis === axes[j]) {
                    crosshairs.splice(i, 1);
                    break;
                }
            }
        }
    };

    PlotAreaBase.prototype.hideCrosshairs = function hideCrosshairs () {
        var crosshairs = this.crosshairs;
        for (var idx = 0; idx < crosshairs.length; idx++) {
            crosshairs[idx].hide();
        }
    };

    PlotAreaBase.prototype.findPane = function findPane (name) {
        var panes = this.panes;
        var matchingPane;

        for (var i = 0; i < panes.length; i++) {
            if (panes[i].options.name === name) {
                matchingPane = panes[i];
                break;
            }
        }

        return matchingPane || panes[0];
    };

    PlotAreaBase.prototype.findPointPane = function findPointPane (point) {
        var panes = this.panes;
        var matchingPane;

        for (var i = 0; i < panes.length; i++) {
            if (panes[i].box.containsPoint(point)) {
                matchingPane = panes[i];
                break;
            }
        }

        return matchingPane;
    };

    PlotAreaBase.prototype.appendAxis = function appendAxis (axis) {
        var pane = this.findPane(axis.options.pane);

        pane.appendAxis(axis);
        this.axes.push(axis);
        axis.plotArea = this;
    };

    PlotAreaBase.prototype.removeAxis = function removeAxis (axisToRemove) {
        var this$1 = this;

        var filteredAxes = [];

        for (var i = 0; i < this.axes.length; i++) {
            var axis = this$1.axes[i];
            if (axisToRemove !== axis) {
                filteredAxes.push(axis);
            } else {
                axis.destroy();
            }
        }

        this.axes = filteredAxes;
    };

    PlotAreaBase.prototype.appendChart = function appendChart (chart, pane) {
        this.charts.push(chart);
        if (pane) {
            pane.appendChart(chart);
        } else {
            this.append(chart);
        }
    };

    PlotAreaBase.prototype.removeChart = function removeChart (chartToRemove) {
        var this$1 = this;

        var filteredCharts = [];

        for (var i = 0; i < this.charts.length; i++) {
            var chart = this$1.charts[i];
            if (chart !== chartToRemove) {
                filteredCharts.push(chart);
            } else {
                chart.destroy();
            }
        }

        this.charts = filteredCharts;
    };

    PlotAreaBase.prototype.addToLegend = function addToLegend (series) {
        var count = series.length;
        var legend = this.options.legend;
        var labels = legend.labels || {};
        var inactiveItems = legend.inactiveItems || {};
        var inactiveItemsLabels = inactiveItems.labels || {};
        var data = [];

        for (var i = 0; i < count; i++) {
            var currentSeries = series[i];
            var seriesVisible = currentSeries.visible !== false;
            if (currentSeries.visibleInLegend === false) {
                continue;
            }

            var text = currentSeries.name;
            var labelTemplate = seriesVisible ? getTemplate(labels) : getTemplate(inactiveItemsLabels) || getTemplate(labels);
            if (labelTemplate) {
                text = labelTemplate({
                    text: hasValue(text) ? text : "",
                    series: currentSeries
                });
            }

            var defaults = currentSeries._defaults;
            var color = currentSeries.color;
            if (isFunction(color) && defaults) {
                color = defaults.color;
            }

            var itemLabelOptions = (void 0), markerColor = (void 0);
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
    };

    PlotAreaBase.prototype.groupAxes = function groupAxes (panes) {
        var xAxes = [];
        var yAxes = [];

        for (var paneIx = 0; paneIx < panes.length; paneIx++) {
            var paneAxes = panes[paneIx].axes;
            for (var axisIx = 0; axisIx < paneAxes.length; axisIx++) {
                var axis = paneAxes[axisIx];
                if (axis.options.vertical) {
                    yAxes.push(axis);
                } else {
                    xAxes.push(axis);
                }
            }
        }

        return { x: xAxes, y: yAxes, any: xAxes.concat(yAxes) };
    };

    PlotAreaBase.prototype.groupSeriesByPane = function groupSeriesByPane () {
        var this$1 = this;

        var series = this.series;
        var seriesByPane = {};

        for (var i = 0; i < series.length; i++) {
            var currentSeries = series[i];
            var pane = this$1.seriesPaneName(currentSeries);

            if (seriesByPane[pane]) {
                seriesByPane[pane].push(currentSeries);
            } else {
                seriesByPane[pane] = [ currentSeries ];
            }
        }

        return seriesByPane;
    };

    PlotAreaBase.prototype.filterVisibleSeries = function filterVisibleSeries (series) {
        var result = [];

        for (var i = 0; i < series.length; i++) {
            var currentSeries = series[i];
            if (currentSeries.visible !== false) {
                result.push(currentSeries);
            }
        }

        return result;
    };

    PlotAreaBase.prototype.reflow = function reflow (targetBox) {
        var options = this.options.plotArea;
        var panes = this.panes;
        var margin = getSpacing(options.margin);

        this.box = targetBox.clone().unpad(margin);
        this.reflowPanes();

        this.detachLabels();
        this.reflowAxes(panes);
        this.reflowCharts(panes);
    };

    PlotAreaBase.prototype.redraw = function redraw (panes) {
        var this$1 = this;

        var panesArray = [].concat(panes);
        this.initSeries();

        //prevents leak during partial redraws. the cached gradients observers retain reference to the destroyed elements.
        var root = this.getRoot();
        if (root) {
            root.cleanGradients();
        }

        for (var i = 0; i < panesArray.length; i++) {
            this$1.removeCrosshairs(panesArray[i]);
            panesArray[i].empty();
        }

        this.render(panesArray);
        this.detachLabels();
        this.reflowAxes(this.panes);
        this.reflowCharts(panesArray);

        this.createCrosshairs(panesArray);

        for (var i$1 = 0; i$1 < panesArray.length; i$1++) {
            panesArray[i$1].refresh();
        }
    };

    PlotAreaBase.prototype.axisCrossingValues = function axisCrossingValues (axis, crossingAxes) {
        var options = axis.options;
        var crossingValues = [].concat(
            options.axisCrossingValues || options.axisCrossingValue
        );
        var valuesToAdd = crossingAxes.length - crossingValues.length;
        var defaultValue = crossingValues[0] || 0;

        for (var i = 0; i < valuesToAdd; i++) {
            crossingValues.push(defaultValue);
        }

        return crossingValues;
    };

    PlotAreaBase.prototype.alignAxisTo = function alignAxisTo (axis, targetAxis, crossingValue, targetCrossingValue) {
        var slot = axis.getSlot(crossingValue, crossingValue, true);
        var slotEdge = axis.options.reverse ? 2 : 1;
        var targetSlot = targetAxis.getSlot(targetCrossingValue, targetCrossingValue, true);
        var targetEdge = targetAxis.options.reverse ? 2 : 1;
        var axisBox = axis.box.translate(
            targetSlot[X + targetEdge] - slot[X + slotEdge],
            targetSlot[Y + targetEdge] - slot[Y + slotEdge]
        );

        if (axis.pane !== targetAxis.pane) {
            axisBox.translate(0, axis.pane.box.y1 - targetAxis.pane.box.y1);
        }

        axis.reflow(axisBox);
    };

    PlotAreaBase.prototype.alignAxes = function alignAxes (xAxes, yAxes) {
        var this$1 = this;

        var xAnchor = xAxes[0];
        var yAnchor = yAxes[0];
        var xAnchorCrossings = this.axisCrossingValues(xAnchor, yAxes);
        var yAnchorCrossings = this.axisCrossingValues(yAnchor, xAxes);
        var leftAnchors = {};
        var rightAnchors = {};
        var topAnchors = {};
        var bottomAnchors = {};

        for (var i = 0; i < yAxes.length; i++) {
            var axis = yAxes[i];
            var pane = axis.pane;
            var paneId = pane.id;
            var visible = axis.options.visible !== false;

            // Locate pane anchor, if any, and use its axisCrossingValues
            var anchor = paneAnchor(xAxes, pane) || xAnchor;
            var anchorCrossings = xAnchorCrossings;

            if (anchor !== xAnchor) {
                anchorCrossings = this$1.axisCrossingValues(anchor, yAxes);
            }

            this$1.alignAxisTo(axis, anchor, yAnchorCrossings[i], anchorCrossings[i]);

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

                this$1.alignAxisTo(axis, anchor, yAnchorCrossings[i], anchorCrossings[i]);

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

        for (var i$1 = 0; i$1 < xAxes.length; i$1++) {
            var axis$1 = xAxes[i$1];
            var pane$1 = axis$1.pane;
            var paneId$1 = pane$1.id;
            var visible$1 = axis$1.options.visible !== false;

            // Locate pane anchor and use its axisCrossingValues
            var anchor$1 = paneAnchor(yAxes, pane$1) || yAnchor;
            var anchorCrossings$1 = yAnchorCrossings;
            if (anchor$1 !== yAnchor) {
                anchorCrossings$1 = this$1.axisCrossingValues(anchor$1, xAxes);
            }

            this$1.alignAxisTo(axis$1, anchor$1, xAnchorCrossings[i$1], anchorCrossings$1[i$1]);

            if (axis$1.options._overlap) {
                continue;
            }

            if (round(axis$1.lineBox().y1) === round(anchor$1.lineBox().y1)) {
                // Flip the labels on top if we're at the top of the pane
                if (!axis$1._mirrored) {
                    axis$1.options.labels.mirror = !axis$1.options.labels.mirror;
                    axis$1._mirrored = true;
                }
                this$1.alignAxisTo(axis$1, anchor$1, xAnchorCrossings[i$1], anchorCrossings$1[i$1]);

                // Push the axis above the previous x-axis so they don't overlap
                if (topAnchors[paneId$1]) {
                    axis$1.reflow(axis$1.box
                        .alignTo(topAnchors[paneId$1].box, TOP)
                        .translate(0, -axis$1.options.margin)
                    );
                }

                if (visible$1) {
                    topAnchors[paneId$1] = axis$1;
                }
            }

            if (round(axis$1.lineBox().y2, COORD_PRECISION) === round(anchor$1.lineBox().y2, COORD_PRECISION)) {
                // Push the axis below the previous x-axis so they don't overlap
                if (bottomAnchors[paneId$1]) {
                    axis$1.reflow(axis$1.box
                        .alignTo(bottomAnchors[paneId$1].box, BOTTOM)
                        .translate(0, axis$1.options.margin)
                    );
                }

                if (visible$1) {
                    bottomAnchors[paneId$1] = axis$1;
                }
            }

            if (i$1 !== 0) {
                axis$1.alignTo(xAnchor);
                axis$1.reflow(axis$1.box);
            }
        }
    };

    PlotAreaBase.prototype.shrinkAxisWidth = function shrinkAxisWidth (panes) {
        var axes = this.groupAxes(panes).any;
        var axisBox = axisGroupBox(axes);
        var overflowX = 0;

        for (var i = 0; i < panes.length; i++) {
            var currentPane = panes[i];

            if (currentPane.axes.length > 0) {
                overflowX = Math.max(
                    overflowX,
                    axisBox.width() - currentPane.contentBox.width()
                );
            }
        }

        if (overflowX !== 0) {
            for (var i$1 = 0; i$1 < axes.length; i$1++) {
                var currentAxis = axes[i$1];

                if (!currentAxis.options.vertical) {
                    currentAxis.reflow(currentAxis.box.shrink(overflowX, 0));
                }
            }
        }
    };

    PlotAreaBase.prototype.shrinkAxisHeight = function shrinkAxisHeight (panes) {
        var shrinked;

        for (var i = 0; i < panes.length; i++) {
            var currentPane = panes[i];
            var axes = currentPane.axes;
            var overflowY = Math.max(0, axisGroupBox(axes).height() - currentPane.contentBox.height());

            if (overflowY !== 0) {
                for (var j = 0; j < axes.length; j++) {
                    var currentAxis = axes[j];

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
    };

    PlotAreaBase.prototype.fitAxes = function fitAxes (panes) {
        var axes = this.groupAxes(panes).any;
        var offsetX = 0;

        for (var i = 0; i < panes.length; i++) {
            var currentPane = panes[i];
            var paneAxes = currentPane.axes;
            var paneBox = currentPane.contentBox;

            if (paneAxes.length > 0) {
                var axisBox = axisGroupBox(paneAxes);
                // OffsetY is calculated and applied per pane
                var offsetY = Math.max(paneBox.y1 - axisBox.y1, paneBox.y2 - axisBox.y2);

                // OffsetX is calculated and applied globally
                offsetX = Math.max(offsetX, paneBox.x1 - axisBox.x1);


                for (var j = 0; j < paneAxes.length; j++) {
                    var currentAxis = paneAxes[j];

                    currentAxis.reflow(
                        currentAxis.box.translate(0, offsetY)
                    );
                }
            }
        }

        for (var i$1 = 0; i$1 < axes.length; i$1++) {
            var currentAxis$1 = axes[i$1];

            currentAxis$1.reflow(
                currentAxis$1.box.translate(offsetX, 0)
            );
        }
    };

    PlotAreaBase.prototype.reflowAxes = function reflowAxes (panes) {
        var this$1 = this;

        var axes = this.groupAxes(panes);

        for (var i = 0; i < panes.length; i++) {
            this$1.reflowPaneAxes(panes[i]);
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
    };

    PlotAreaBase.prototype.autoRotateAxisLabels = function autoRotateAxisLabels (groupedAxes) {
        var this$1 = this;

        var ref = this;
        var panes = ref.panes;
        var axes = allPaneAxes(panes);
        var rotated;

        for (var idx = 0; idx < axes.length; idx++) {
            var axis = axes[idx];
            if (axis.autoRotateLabels()) {
                rotated = true;
            }
        }

        if (rotated) {
            for (var idx$1 = 0; idx$1 < panes.length; idx$1++) {
                this$1.reflowPaneAxes(panes[idx$1]);
            }

            if (groupedAxes.x.length > 0 && groupedAxes.y.length > 0) {
                this.alignAxes(groupedAxes.x, groupedAxes.y);
                this.shrinkAxisWidth(panes);
            }
        }
    };

    PlotAreaBase.prototype.reflowPaneAxes = function reflowPaneAxes (pane) {
        var axes = pane.axes;
        var length = axes.length;

        if (length > 0) {
            for (var i = 0; i < length; i++) {
                axes[i].reflow(pane.contentBox);
            }
        }
    };

    PlotAreaBase.prototype.reflowCharts = function reflowCharts (panes) {
        var charts = this.charts;
        var count = charts.length;
        var box = this.box;

        for (var i = 0; i < count; i++) {
            var chartPane = charts[i].pane;
            if (!chartPane || inArray(chartPane, panes)) {
                charts[i].reflow(box);
            }
        }
    };

    PlotAreaBase.prototype.reflowPanes = function reflowPanes () {
        var ref = this;
        var box = ref.box;
        var panes = ref.panes;
        var panesLength = panes.length;
        var remainingHeight = box.height();
        var remainingPanes = panesLength;
        var autoHeightPanes = 0;
        var top = box.y1;

        for (var i = 0; i < panesLength; i++) {
            var currentPane = panes[i];
            var height = currentPane.options.height;

            currentPane.options.width = box.width();

            if (!currentPane.options.height) {
                autoHeightPanes++;
            } else {
                if (height.indexOf && height.indexOf("%")) {
                    var percents = parseInt(height, 10) / 100;
                    currentPane.options.height = percents * box.height();
                }

                currentPane.reflow(box.clone());

                remainingHeight -= currentPane.options.height;
            }
        }

        for (var i$1 = 0; i$1 < panesLength; i$1++) {
            var currentPane$1 = panes[i$1];

            if (!currentPane$1.options.height) {
                currentPane$1.options.height = remainingHeight / autoHeightPanes;
            }
        }

        for (var i$2 = 0; i$2 < panesLength; i$2++) {
            var currentPane$2 = panes[i$2];
            var paneBox = box
                .clone()
                .move(box.x1, top);

            currentPane$2.reflow(paneBox);

            remainingPanes--;
            top += currentPane$2.options.height;
        }
    };

    PlotAreaBase.prototype.backgroundBox = function backgroundBox () {
        var axes = this.axes;
        var axesCount = axes.length;
        var box;

        for (var i = 0; i < axesCount; i++) {
            var axisA = axes[i];

            for (var j = 0; j < axesCount; j++) {
                var axisB = axes[j];

                if (axisA.options.vertical !== axisB.options.vertical) {
                    var lineBox = axisA.lineBox().clone().wrap(axisB.lineBox());

                    if (!box) {
                        box = lineBox;
                    } else {
                        box = box.wrap(lineBox);
                    }
                }
            }
        }

        return box || this.box;
    };

    PlotAreaBase.prototype.chartsBoxes = function chartsBoxes () {
        var panes = this.panes;
        var boxes = [];

        for (var idx = 0; idx < panes.length; idx++) {
            boxes.push(panes[idx].chartsBox());
        }

        return boxes;
    };

    PlotAreaBase.prototype.addBackgroundPaths = function addBackgroundPaths (multipath) {
        var boxes = this.chartsBoxes();
        for (var idx = 0; idx < boxes.length; idx++) {
            multipath.paths.push(draw.Path.fromRect(boxes[idx].toRect()));
        }
    };

    PlotAreaBase.prototype.backgroundContainsPoint = function backgroundContainsPoint (point) {
        var boxes = this.chartsBoxes();
        for (var idx = 0; idx < boxes.length; idx++) {
            if (boxes[idx].containsPoint(point)) {
                return true;
            }
        }
    };

    PlotAreaBase.prototype.createVisual = function createVisual () {
        ChartElement.prototype.createVisual.call(this);

        var options = this.options.plotArea;
        var opacity = options.opacity;
        var background = options.background;
        var border = options.border; if ( border === void 0 ) border = {};
        if (isTransparent(background)) {
            background = WHITE;
            opacity = 0;
        }

        var bg = this._bgVisual = new draw.MultiPath({
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
    };

    PlotAreaBase.prototype.pointsByCategoryIndex = function pointsByCategoryIndex (categoryIndex) {
        var charts = this.charts;
        var result = [];

        if (categoryIndex !== null) {
            for (var i = 0; i < charts.length; i++) {
                var chart = charts[i];
                if (chart.pane.options.name === "_navigator") {
                    continue;
                }

                var points = charts[i].categoryPoints[categoryIndex];
                if (points && points.length) {
                    for (var j = 0; j < points.length; j++) {
                        var point = points[j];
                        if (point && defined(point.value) && point.value !== null) {
                            result.push(point);
                        }
                    }
                }
            }
        }

        return result;
    };

    PlotAreaBase.prototype.pointsBySeriesIndex = function pointsBySeriesIndex (seriesIndex) {
        return this.filterPoints(function(point) {
            return point.series.index === seriesIndex;
        });
    };

    PlotAreaBase.prototype.pointsBySeriesName = function pointsBySeriesName (name) {
        return this.filterPoints(function(point) {
            return point.series.name === name;
        });
    };

    PlotAreaBase.prototype.filterPoints = function filterPoints (callback) {
        var charts = this.charts;
        var result = [];

        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];
            var points = chart.points;
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                if (point && point.visible !== false && callback(point)) {
                    result.push(point);
                }
            }
        }

        return result;
    };

    PlotAreaBase.prototype.findPoint = function findPoint (callback) {
        var charts = this.charts;

        for (var i = 0; i < charts.length; i++) {
            var chart = charts[i];
            var points = chart.points;
            for (var j = 0; j < points.length; j++) {
                var point = points[j];
                if (point && point.visible !== false && callback(point)) {
                    return point;
                }
            }
        }
    };

    PlotAreaBase.prototype.paneByPoint = function paneByPoint (point) {
        var panes = this.panes;

        for (var i = 0; i < panes.length; i++) {
            var pane = panes[i];
            if (pane.box.containsPoint(point)) {
                return pane;
            }
        }
    };

    PlotAreaBase.prototype.detachLabels = function detachLabels () {
        var axes = this.groupAxes(this.panes);
        var xAxes = axes.x;
        var yAxes = axes.y;

        this.detachAxisGroupLabels(yAxes, xAxes);
        this.detachAxisGroupLabels(xAxes, yAxes);
    };

    PlotAreaBase.prototype.detachAxisGroupLabels = function detachAxisGroupLabels (axes, crossingAxes) {
        var this$1 = this;

        var labelAxisCount = 0;

        for (var i = 0; i < axes.length; i++) {
            var axis = axes[i];
            var pane = axis.pane;
            var anchor = paneAnchor(crossingAxes, pane) || crossingAxes[0];
            var axisIndex = i + labelAxisCount;
            var labelAxis = this$1.createLabelAxis(axis, axisIndex, anchor);

            if (labelAxis) {
                labelAxisCount++;

                var pos = pane.axes.indexOf(axis) + labelAxisCount;
                pane.appendAxisAt(labelAxis, pos);
            }
        }
    };

    PlotAreaBase.prototype.createLabelAxis = function createLabelAxis (axis, axisIndex, anchor) {
        var labelOptions = axis.options.labels;
        var position = labelOptions.position;
        var onAxis = position !== END && position !== START;
        var visible = labelOptions.visible;

        if (onAxis || visible === false) {
            return null;
        }

        var allAxes = this.groupAxes(this.panes);
        var crossingAxes = anchor.options.vertical ? allAxes.x : allAxes.y;
        var anchorCrossings = this.axisCrossingValues(anchor, crossingAxes);
        var end = position === END;
        var range = anchor.range();
        var edge = end ? range.max : range.min;
        var crossingValue = limitValue(anchorCrossings[axisIndex], range.min, range.max);

        if (crossingValue - edge === 0) {
            return null;
        }

        anchorCrossings.splice(axisIndex + 1, 0, edge);
        anchor.options.axisCrossingValues = anchorCrossings;

        var labelAxis = axis.clone();
        axis.clear();

        labelAxis.options.name = undefined;
        labelAxis.options.line.visible = false;

        labelAxis.options.crosshair = undefined;
        labelAxis.options.notes = undefined;
        labelAxis.options.plotBands = undefined;

        return labelAxis;
    };

    return PlotAreaBase;
}(ChartElement));

function isSingleAxis(axis) {
    return !axis.pane.axes.some(function (a) { return a.options.vertical === axis.options.vertical && a !== axis && a.options.visible !== false; }
    );
}

function axisGroupBox(axes) {
    var length = axes.length;
    var box;

    for (var i = 0; i < length; i++) {
        var axis = axes[i];
        var visible = axis.options.visible !== false;
        if (visible || isSingleAxis(axis)) {
            var axisBox = visible ? axis.contentBox() : axis.lineBox();

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
    for (var i = 0; i < axes.length; i++) {
        var anchor = axes[i];
        if (anchor && anchor.pane === pane) {
            return anchor;
        }
    }
}

function isTransparent(color) {
    return color === "" || color === null || color === "none" || color === "transparent" || !defined(color);
}

var allPaneAxes = function (panes) { return panes.reduce(function (acc, pane) { return acc.concat(pane.axes); }, []); };

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
