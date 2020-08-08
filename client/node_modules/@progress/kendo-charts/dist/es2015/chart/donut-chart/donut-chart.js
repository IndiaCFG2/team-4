import PieChart from '../pie-chart/pie-chart';
import DonutSegment from './donut-segment';

import { INITIAL_ANIMATION_DURATION } from '../constants';

import { deepExtend, defined, setDefaultOptions, valueOrDefault } from '../../common';

const DONUT_SECTOR_ANIM_DELAY = 50;

class DonutChart extends PieChart {
    addValue(value, sector, fields) {
        const segmentOptions = deepExtend({}, fields.series, { index: fields.index });
        this.evalSegmentOptions(segmentOptions, value, fields);

        this.createLegendItem(value, segmentOptions, fields);

        if (!value || fields.visible === false) {
            return;
        }

        const segment = new DonutSegment(value, sector, segmentOptions);

        Object.assign(segment, fields);
        this.append(segment);
        this.points.push(segment);
    }

    reflow(targetBox) {
        const options = this.options;
        const box = targetBox.clone();
        const space = 5;
        const minWidth = Math.min(box.width(), box.height());
        const halfMinWidth = minWidth / 2;
        const defaultPadding = minWidth - minWidth * 0.85;
        const series = options.series;
        const seriesCount = series.length;

        let padding = valueOrDefault(options.padding, defaultPadding);
        padding = padding > halfMinWidth - space ? halfMinWidth - space : padding;

        let totalSize = halfMinWidth - padding;
        let seriesWithoutSize = 0;
        let holeSize;

        for (let i = 0; i < seriesCount; i++) {
            const currentSeries = series[i];
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
            const currentSize = (halfMinWidth - padding) / (seriesCount + 0.75);
            holeSize = currentSize * 0.75;
            totalSize -= holeSize;
        }

        let innerRadius = holeSize;
        let margin = 0;
        let size, radius;

        this.seriesConfigs = [];

        for (let i = 0; i < seriesCount; i++) {
            const currentSeries = series[i];
            size = valueOrDefault(currentSeries.size, totalSize / seriesWithoutSize);
            innerRadius += margin;
            radius = innerRadius + size;
            this.seriesConfigs.push({ innerRadius: innerRadius, radius: radius });
            margin = currentSeries.margin || 0;
            innerRadius = radius;
        }

        super.reflow(targetBox);
    }

    animationDelay(categoryIndex, seriesIndex, seriesCount) {
        return categoryIndex * DONUT_SECTOR_ANIM_DELAY +
            (INITIAL_ANIMATION_DURATION * (seriesIndex + 1) / (seriesCount + 1));
    }
}


setDefaultOptions(DonutChart, {
    startAngle: 90,
    connectors: {
        width: 2,
        color: "#939393",
        padding: 8
    }
});

export default DonutChart;