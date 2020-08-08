import { geometry as geom, Color } from '@progress/kendo-drawing';

import { ChartElement, TextBox } from '../../core';
import PieChartMixin from '../mixins/pie-chart-mixin';
import FunnelSegment from './funnel-segment';

import { bindSegments, evalOptions } from '../utils';

import { BLACK, WHITE, CENTER, LEFT } from '../../common/constants';
import { deepExtend, isFunction, getTemplate, limitValue, setDefaultOptions } from '../../common';

var FunnelChart = (function (ChartElement) {
    function FunnelChart(plotArea, options) {
        ChartElement.call(this, options);

        this.plotArea = plotArea;
        this.points = [];
        this.labels = [];
        this.legendItems = [];
        this.render();
    }

    if ( ChartElement ) FunnelChart.__proto__ = ChartElement;
    FunnelChart.prototype = Object.create( ChartElement && ChartElement.prototype );
    FunnelChart.prototype.constructor = FunnelChart;

    FunnelChart.prototype.formatPointValue = function formatPointValue (point, format) {
        return this.chartService.format.auto(format,point.value);
    };

    FunnelChart.prototype.render = function render () {
        var this$1 = this;

        var ref = this;
        var options = ref.options;
        var seriesColors = ref.plotArea.options.seriesColors; if ( seriesColors === void 0 ) seriesColors = [];
        var series = options.series[0];
        var data = series.data;

        if (!data) {
            return;
        }

        var ref$1 = bindSegments(series);
        var total = ref$1.total;
        var points = ref$1.points;

        for (var i = 0; i < points.length; i++) {
            var pointData = points[i];

            if (!pointData) {
                continue;
            }

            var fields = pointData.fields;

            if (!isFunction(series.color)) {
                series.color = fields.color || seriesColors[i % seriesColors.length];
            }

            fields = deepExtend({
                index: i,
                owner: this$1,
                series: series,
                dataItem: data[i],
                percentage: pointData.value / total
            }, fields, { visible: pointData.visible });

            var value = pointData.valueFields.value;
            var segment = this$1.createSegment(value, fields);
            var label = this$1.createLabel(value, fields);

            if (segment && label) {
                segment.append(label);
            }
        }
    };

    FunnelChart.prototype.evalSegmentOptions = function evalSegmentOptions (options, value, fields) {
        var series = fields.series;

        evalOptions(options, {
            value: value,
            series: series,
            dataItem: fields.dataItem,
            index: fields.index
        }, { defaults: series._defaults, excluded: [ "data", "content", "template", "toggle", "visual" ] });
    };

    FunnelChart.prototype.createSegment = function createSegment (value, fields) {
        var seriesOptions = deepExtend({}, fields.series);
        this.evalSegmentOptions(seriesOptions, value, fields);

        this.createLegendItem(value, seriesOptions, fields);

        if (fields.visible !== false) {

            var segment = new FunnelSegment(value, seriesOptions, fields);
            Object.assign(segment, fields);

            this.append(segment);
            this.points.push(segment);

            return segment;
        }
    };

    FunnelChart.prototype.createLabel = function createLabel (value, fields) {
        var series = fields.series;
        var dataItem = fields.dataItem;
        var labels = deepExtend({}, this.options.labels, series.labels);
        var text = value;

        if (labels.visible) {
            var labelTemplate = getTemplate(labels);
            var data = {
                dataItem: dataItem,
                value: value,
                percentage: fields.percentage,
                category: fields.category,
                series: series
            };
            if (labelTemplate) {
                text = labelTemplate(data);
            } else if (labels.format) {
                text = this.plotArea.chartService.format.auto(labels.format, text);
            }

            if (!labels.color) {
                var brightnessValue = new Color(series.color).percBrightness();
                if (brightnessValue > 180) {
                    labels.color = BLACK;
                } else {
                    labels.color = WHITE;
                }
                if (!labels.background) {
                    labels.background = series.color;
                }
            }

            this.evalSegmentOptions(labels, value, fields);
            var textBox = new TextBox(text, deepExtend({
                vAlign: labels.position
            }, labels), data);

            this.labels.push(textBox);

            return textBox;
        }
    };

    FunnelChart.prototype.labelPadding = function labelPadding () {
        var labels = this.labels;
        var padding = { left: 0, right: 0 };

        for (var i = 0; i < labels.length; i++) {
            var label = labels[i];
            var align = label.options.align;
            if (align !== CENTER) {
                var width = labels[i].box.width();

                if (align === LEFT) {
                    padding.left = Math.max(padding.left, width);
                } else {
                    padding.right = Math.max(padding.right, width);
                }
            }
        }

        return padding;
    };

    FunnelChart.prototype.dynamicSlopeReflow = function dynamicSlopeReflow (box, width, totalHeight) {
        var ref = this;
        var options = ref.options;
        var segments = ref.points;
        var count = segments.length;
        var firstSegment = segments[0];
        var maxSegment = firstSegment;

        for (var idx = 0; idx < segments.length; idx++) {
            if (segments[idx].percentage > maxSegment.percentage) {
                maxSegment = segments[idx];
            }
        }

        var lastUpperSide = (firstSegment.percentage / maxSegment.percentage) * width;
        var previousOffset = (width - lastUpperSide) / 2;
        var previousHeight = 0;

        for (var idx$1 = 0; idx$1 < count; idx$1++) {
            var percentage = segments[idx$1].percentage;
            var nextSegment = segments[idx$1 + 1];
            var nextPercentage = (nextSegment ? nextSegment.percentage : percentage);
            var points = segments[idx$1].points = [];
            var height = (options.dynamicHeight) ? (totalHeight * percentage) : (totalHeight / count);
            var offset = (void 0);

            if (!percentage) {
                offset = nextPercentage ? 0 : width / 2;
            } else {
                offset = (width - lastUpperSide * (nextPercentage / percentage)) / 2;
            }

            offset = limitValue(offset, 0, width);

            points.push(new geom.Point(box.x1 + previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - offset, box.y1 + height + previousHeight));
            points.push(new geom.Point(box.x1 + offset, box.y1 + height + previousHeight));

            previousOffset = offset;
            previousHeight += height + options.segmentSpacing;
            lastUpperSide = limitValue(width - 2 * offset, 0, width);
        }
    };

    FunnelChart.prototype.constantSlopeReflow = function constantSlopeReflow (box, width, totalHeight) {
        var ref = this;
        var options = ref.options;
        var segments = ref.points;
        var count = segments.length;
        var decreasingWidth = options.neckRatio <= 1;
        var neckRatio = decreasingWidth ? options.neckRatio * width : width;
        var previousOffset = decreasingWidth ? 0 : (width - width / options.neckRatio) / 2;
        var topMostWidth = decreasingWidth ? width : width - previousOffset * 2;
        var finalNarrow = (topMostWidth - neckRatio) / 2;
        var previousHeight = 0;

        for (var idx = 0; idx < count; idx++) {
            var points = segments[idx].points = [];
            var percentage = segments[idx].percentage;
            var offset = (options.dynamicHeight) ? (finalNarrow * percentage) : (finalNarrow / count);
            var height = (options.dynamicHeight) ? (totalHeight * percentage) : (totalHeight / count);

            points.push(new geom.Point(box.x1 + previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - previousOffset - offset, box.y1 + height + previousHeight));
            points.push(new geom.Point(box.x1 + previousOffset + offset,box.y1 + height + previousHeight));
            previousOffset += offset;
            previousHeight += height + options.segmentSpacing;
        }
    };

    FunnelChart.prototype.reflow = function reflow (chartBox) {
        var points = this.points;
        var count = points.length;

        if (!count) {
            return;
        }

        var options = this.options;
        var box = chartBox.clone().unpad(this.labelPadding());
        var totalHeight = box.height() - options.segmentSpacing * (count - 1);
        var width = box.width();

        if (options.dynamicSlope) {
            this.dynamicSlopeReflow(box, width, totalHeight);
        } else {
            this.constantSlopeReflow(box, width, totalHeight);
        }

        for (var idx = 0; idx < count; idx++) {
            points[idx].reflow(chartBox);
        }
    };

    return FunnelChart;
}(ChartElement));

setDefaultOptions(FunnelChart, {
    neckRatio: 0.3,
    width: 300,
    dynamicSlope: false,
    dynamicHeight: true,
    segmentSpacing: 0,
    labels: {
        visible: false,
        align: CENTER,
        position: CENTER,
        zIndex: 1
    }
});

deepExtend(FunnelChart.prototype, PieChartMixin);

export default FunnelChart;
