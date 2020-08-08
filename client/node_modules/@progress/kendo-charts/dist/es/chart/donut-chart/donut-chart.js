import PieChart from '../pie-chart/pie-chart';
import DonutSegment from './donut-segment';

import { INITIAL_ANIMATION_DURATION } from '../constants';

import { deepExtend, defined, setDefaultOptions, valueOrDefault } from '../../common';

var DONUT_SECTOR_ANIM_DELAY = 50;

var DonutChart = (function (PieChart) {
    function DonutChart () {
        PieChart.apply(this, arguments);
    }

    if ( PieChart ) DonutChart.__proto__ = PieChart;
    DonutChart.prototype = Object.create( PieChart && PieChart.prototype );
    DonutChart.prototype.constructor = DonutChart;

    DonutChart.prototype.addValue = function addValue (value, sector, fields) {
        var segmentOptions = deepExtend({}, fields.series, { index: fields.index });
        this.evalSegmentOptions(segmentOptions, value, fields);

        this.createLegendItem(value, segmentOptions, fields);

        if (!value || fields.visible === false) {
            return;
        }

        var segment = new DonutSegment(value, sector, segmentOptions);

        Object.assign(segment, fields);
        this.append(segment);
        this.points.push(segment);
    };

    DonutChart.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        var options = this.options;
        var box = targetBox.clone();
        var space = 5;
        var minWidth = Math.min(box.width(), box.height());
        var halfMinWidth = minWidth / 2;
        var defaultPadding = minWidth - minWidth * 0.85;
        var series = options.series;
        var seriesCount = series.length;

        var padding = valueOrDefault(options.padding, defaultPadding);
        padding = padding > halfMinWidth - space ? halfMinWidth - space : padding;

        var totalSize = halfMinWidth - padding;
        var seriesWithoutSize = 0;
        var holeSize;

        for (var i = 0; i < seriesCount; i++) {
            var currentSeries = series[i];
            if (i === 0) {
                if (defined(currentSeries.holeSize)) {
                    holeSize = currentSeries.holeSize;
                    totalSize -= currentSeries.holeSize;
                }
            }

            if (defined(currentSeries.size)) {
                totalSize -= currentSeries.size;
            } else {
                seriesWithoutSize++;
            }

            if (defined(currentSeries.margin) && i !== seriesCount - 1) {
                totalSize -= currentSeries.margin;
            }
        }

        if (!defined(holeSize)) {
            var currentSize = (halfMinWidth - padding) / (seriesCount + 0.75);
            holeSize = currentSize * 0.75;
            totalSize -= holeSize;
        }

        var innerRadius = holeSize;
        var margin = 0;
        var size, radius;

        this.seriesConfigs = [];

        for (var i$1 = 0; i$1 < seriesCount; i$1++) {
            var currentSeries$1 = series[i$1];
            size = valueOrDefault(currentSeries$1.size, totalSize / seriesWithoutSize);
            innerRadius += margin;
            radius = innerRadius + size;
            this$1.seriesConfigs.push({ innerRadius: innerRadius, radius: radius });
            margin = currentSeries$1.margin || 0;
            innerRadius = radius;
        }

        PieChart.prototype.reflow.call(this, targetBox);
    };

    DonutChart.prototype.animationDelay = function animationDelay (categoryIndex, seriesIndex, seriesCount) {
        return categoryIndex * DONUT_SECTOR_ANIM_DELAY +
            (INITIAL_ANIMATION_DURATION * (seriesIndex + 1) / (seriesCount + 1));
    };

    return DonutChart;
}(PieChart));


setDefaultOptions(DonutChart, {
    startAngle: 90,
    connectors: {
        width: 2,
        color: "#939393",
        padding: 8
    }
});

export default DonutChart;