import { geometry as geom, Color } from '@progress/kendo-drawing';

import { ChartElement, TextBox } from '../../core';
import PieChartMixin from '../mixins/pie-chart-mixin';
import FunnelSegment from './funnel-segment';

import { bindSegments, evalOptions } from '../utils';

import { BLACK, WHITE, CENTER, LEFT } from '../../common/constants';
import { deepExtend, isFunction, getTemplate, limitValue, setDefaultOptions } from '../../common';

class FunnelChart extends ChartElement {
    constructor(plotArea, options) {
        super(options);

        this.plotArea = plotArea;
        this.points = [];
        this.labels = [];
        this.legendItems = [];
        this.render();
    }

    formatPointValue(point, format) {
        return this.chartService.format.auto(format,point.value);
    }

    render() {
        const { options, plotArea: { options: { seriesColors = [] } } } = this;
        const series = options.series[0];
        const data = series.data;

        if (!data) {
            return;
        }

        const { total, points } = bindSegments(series);

        for (let i = 0; i < points.length; i++) {
            const pointData = points[i];

            if (!pointData) {
                continue;
            }

            let fields = pointData.fields;

            if (!isFunction(series.color)) {
                series.color = fields.color || seriesColors[i % seriesColors.length];
            }

            fields = deepExtend({
                index: i,
                owner: this,
                series: series,
                dataItem: data[i],
                percentage: pointData.value / total
            }, fields, { visible: pointData.visible });

            const value = pointData.valueFields.value;
            const segment = this.createSegment(value, fields);
            const label = this.createLabel(value, fields);

            if (segment && label) {
                segment.append(label);
            }
        }
    }

    evalSegmentOptions(options, value, fields) {
        const series = fields.series;

        evalOptions(options, {
            value: value,
            series: series,
            dataItem: fields.dataItem,
            index: fields.index
        }, { defaults: series._defaults, excluded: [ "data", "content", "template", "toggle", "visual" ] });
    }

    createSegment(value, fields) {
        const seriesOptions = deepExtend({}, fields.series);
        this.evalSegmentOptions(seriesOptions, value, fields);

        this.createLegendItem(value, seriesOptions, fields);

        if (fields.visible !== false) {

            const segment = new FunnelSegment(value, seriesOptions, fields);
            Object.assign(segment, fields);

            this.append(segment);
            this.points.push(segment);

            return segment;
        }
    }

    createLabel(value, fields) {
        const { series, dataItem } = fields;
        const labels = deepExtend({}, this.options.labels, series.labels);
        let text = value;

        if (labels.visible) {
            const labelTemplate = getTemplate(labels);
            const data = {
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
                const brightnessValue = new Color(series.color).percBrightness();
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
            const textBox = new TextBox(text, deepExtend({
                vAlign: labels.position
            }, labels), data);

            this.labels.push(textBox);

            return textBox;
        }
    }

    labelPadding() {
        const labels = this.labels;
        const padding = { left: 0, right: 0 };

        for (let i = 0; i < labels.length; i++) {
            const label = labels[i];
            const align = label.options.align;
            if (align !== CENTER) {
                const width = labels[i].box.width();

                if (align === LEFT) {
                    padding.left = Math.max(padding.left, width);
                } else {
                    padding.right = Math.max(padding.right, width);
                }
            }
        }

        return padding;
    }

    dynamicSlopeReflow(box, width, totalHeight) {
        const { options, points: segments } = this;
        const count = segments.length;
        const firstSegment = segments[0];
        let maxSegment = firstSegment;

        for (let idx = 0; idx < segments.length; idx++) {
            if (segments[idx].percentage > maxSegment.percentage) {
                maxSegment = segments[idx];
            }
        }

        let lastUpperSide = (firstSegment.percentage / maxSegment.percentage) * width;
        let previousOffset = (width - lastUpperSide) / 2;
        let previousHeight = 0;

        for (let idx = 0; idx < count; idx++) {
            const percentage = segments[idx].percentage;
            const nextSegment = segments[idx + 1];
            const nextPercentage = (nextSegment ? nextSegment.percentage : percentage);
            const points = segments[idx].points = [];
            const height = (options.dynamicHeight) ? (totalHeight * percentage) : (totalHeight / count);
            let offset;

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
    }

    constantSlopeReflow(box, width, totalHeight) {
        const { options, points: segments } = this;
        const count = segments.length;
        const decreasingWidth = options.neckRatio <= 1;
        const neckRatio = decreasingWidth ? options.neckRatio * width : width;
        let previousOffset = decreasingWidth ? 0 : (width - width / options.neckRatio) / 2;
        const topMostWidth = decreasingWidth ? width : width - previousOffset * 2;
        const finalNarrow = (topMostWidth - neckRatio) / 2;
        let previousHeight = 0;

        for (let idx = 0; idx < count; idx++) {
            const points = segments[idx].points = [];
            const percentage = segments[idx].percentage;
            const offset = (options.dynamicHeight) ? (finalNarrow * percentage) : (finalNarrow / count);
            const height = (options.dynamicHeight) ? (totalHeight * percentage) : (totalHeight / count);

            points.push(new geom.Point(box.x1 + previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - previousOffset, box.y1 + previousHeight));
            points.push(new geom.Point(box.x1 + width - previousOffset - offset, box.y1 + height + previousHeight));
            points.push(new geom.Point(box.x1 + previousOffset + offset,box.y1 + height + previousHeight));
            previousOffset += offset;
            previousHeight += height + options.segmentSpacing;
        }
    }

    reflow(chartBox) {
        const points = this.points;
        const count = points.length;

        if (!count) {
            return;
        }

        const options = this.options;
        const box = chartBox.clone().unpad(this.labelPadding());
        const totalHeight = box.height() - options.segmentSpacing * (count - 1);
        const width = box.width();

        if (options.dynamicSlope) {
            this.dynamicSlopeReflow(box, width, totalHeight);
        } else {
            this.constantSlopeReflow(box, width, totalHeight);
        }

        for (let idx = 0; idx < count; idx++) {
            points[idx].reflow(chartBox);
        }
    }
}

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
