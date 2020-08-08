import ScatterChart from '../scatter-charts/scatter-chart';
import Bubble from './bubble';

import { INITIAL_ANIMATION_DURATION, BUBBLE } from '../constants';

import { MIN_VALUE, CIRCLE } from '../../common/constants';
import { deepExtend, isFunction, setDefaultOptions, valueOrDefault } from '../../common';

class BubbleChart extends ScatterChart {
    _initFields() {
        this._maxSize = MIN_VALUE;
        super._initFields();
    }

    addValue(value, fields) {
        if (value.size !== null && (value.size > 0 || (value.size < 0 && fields.series.negativeValues.visible))) {
            this._maxSize = Math.max(this._maxSize, Math.abs(value.size));
            super.addValue(value, fields);
        } else {
            this.points.push(null);
            this.seriesPoints[fields.seriesIx].push(null);
        }
    }

    reflow(box) {
        this.updateBubblesSize(box);
        super.reflow(box);
    }

    pointType() {
        return Bubble;
    }

    createPoint(value, fields) {
        const series = fields.series;
        const pointsCount = series.data.length;
        const delay = fields.pointIx * (INITIAL_ANIMATION_DURATION / pointsCount);
        const animationOptions = {
            delay: delay,
            duration: INITIAL_ANIMATION_DURATION - delay,
            type: BUBBLE
        };

        let color = fields.color || series.color;
        if (value.size < 0 && series.negativeValues.visible) {
            color = valueOrDefault(
                series.negativeValues.color, color
            );
        }

        let pointOptions = deepExtend({
            labels: {
                animation: {
                    delay: delay,
                    duration: INITIAL_ANIMATION_DURATION - delay
                }
            }
        }, this.pointOptions(series, fields.seriesIx), {
            markers: {
                type: CIRCLE,
                border: series.border,
                opacity: series.opacity,
                animation: animationOptions
            }
        });

        pointOptions = this.evalPointOptions(pointOptions, value, fields);
        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        pointOptions.markers.background = color;

        const point = new Bubble(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    }

    updateBubblesSize(box) {
        const { options: { series } } = this;
        const boxSize = Math.min(box.width(), box.height());

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const currentSeries = series[seriesIx];
            const seriesPoints = this.seriesPoints[seriesIx];
            const minSize = currentSeries.minSize || Math.max(boxSize * 0.02, 10);
            const maxSize = currentSeries.maxSize || boxSize * 0.2;
            const minR = minSize / 2;
            const maxR = maxSize / 2;
            const minArea = Math.PI * minR * minR;
            const maxArea = Math.PI * maxR * maxR;
            const areaRange = maxArea - minArea;
            const areaRatio = areaRange / this._maxSize;

            for (let pointIx = 0; pointIx < seriesPoints.length; pointIx++) {
                const point = seriesPoints[pointIx];
                if (point) {
                    const area = Math.abs(point.value.size) * areaRatio;
                    const radius = Math.sqrt((minArea + area) / Math.PI);
                    const baseZIndex = valueOrDefault(point.options.zIndex, 0);
                    const zIndex = baseZIndex + (1 - radius / maxR);

                    deepExtend(point.options, {
                        zIndex: zIndex,
                        markers: {
                            size: radius * 2,
                            zIndex: zIndex
                        },
                        labels: {
                            zIndex: zIndex + 1
                        }
                    });
                }
            }
        }
    }

    formatPointValue(point, format) {
        const value = point.value;
        return this.chartService.format.auto(format, value.x, value.y, value.size, point.category);
    }

    createAnimation() {}
    createVisual() {}
}

setDefaultOptions(BubbleChart, {
    tooltip: {
        format: "{3}"
    },
    labels: {
        format: "{3}"
    }
});

export default BubbleChart;