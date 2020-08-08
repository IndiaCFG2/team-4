import ScatterChart from '../scatter-charts/scatter-chart';
import Bubble from './bubble';

import { INITIAL_ANIMATION_DURATION, BUBBLE } from '../constants';

import { MIN_VALUE, CIRCLE } from '../../common/constants';
import { deepExtend, isFunction, setDefaultOptions, valueOrDefault } from '../../common';

var BubbleChart = (function (ScatterChart) {
    function BubbleChart () {
        ScatterChart.apply(this, arguments);
    }

    if ( ScatterChart ) BubbleChart.__proto__ = ScatterChart;
    BubbleChart.prototype = Object.create( ScatterChart && ScatterChart.prototype );
    BubbleChart.prototype.constructor = BubbleChart;

    BubbleChart.prototype._initFields = function _initFields () {
        this._maxSize = MIN_VALUE;
        ScatterChart.prototype._initFields.call(this);
    };

    BubbleChart.prototype.addValue = function addValue (value, fields) {
        if (value.size !== null && (value.size > 0 || (value.size < 0 && fields.series.negativeValues.visible))) {
            this._maxSize = Math.max(this._maxSize, Math.abs(value.size));
            ScatterChart.prototype.addValue.call(this, value, fields);
        } else {
            this.points.push(null);
            this.seriesPoints[fields.seriesIx].push(null);
        }
    };

    BubbleChart.prototype.reflow = function reflow (box) {
        this.updateBubblesSize(box);
        ScatterChart.prototype.reflow.call(this, box);
    };

    BubbleChart.prototype.pointType = function pointType () {
        return Bubble;
    };

    BubbleChart.prototype.createPoint = function createPoint (value, fields) {
        var series = fields.series;
        var pointsCount = series.data.length;
        var delay = fields.pointIx * (INITIAL_ANIMATION_DURATION / pointsCount);
        var animationOptions = {
            delay: delay,
            duration: INITIAL_ANIMATION_DURATION - delay,
            type: BUBBLE
        };

        var color = fields.color || series.color;
        if (value.size < 0 && series.negativeValues.visible) {
            color = valueOrDefault(
                series.negativeValues.color, color
            );
        }

        var pointOptions = deepExtend({
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

        var point = new Bubble(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    };

    BubbleChart.prototype.updateBubblesSize = function updateBubblesSize (box) {
        var this$1 = this;

        var ref = this;
        var series = ref.options.series;
        var boxSize = Math.min(box.width(), box.height());

        for (var seriesIx = 0; seriesIx < series.length; seriesIx++) {
            var currentSeries = series[seriesIx];
            var seriesPoints = this$1.seriesPoints[seriesIx];
            var minSize = currentSeries.minSize || Math.max(boxSize * 0.02, 10);
            var maxSize = currentSeries.maxSize || boxSize * 0.2;
            var minR = minSize / 2;
            var maxR = maxSize / 2;
            var minArea = Math.PI * minR * minR;
            var maxArea = Math.PI * maxR * maxR;
            var areaRange = maxArea - minArea;
            var areaRatio = areaRange / this$1._maxSize;

            for (var pointIx = 0; pointIx < seriesPoints.length; pointIx++) {
                var point = seriesPoints[pointIx];
                if (point) {
                    var area = Math.abs(point.value.size) * areaRatio;
                    var radius = Math.sqrt((minArea + area) / Math.PI);
                    var baseZIndex = valueOrDefault(point.options.zIndex, 0);
                    var zIndex = baseZIndex + (1 - radius / maxR);

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
    };

    BubbleChart.prototype.formatPointValue = function formatPointValue (point, format) {
        var value = point.value;
        return this.chartService.format.auto(format, value.x, value.y, value.size, point.category);
    };

    BubbleChart.prototype.createAnimation = function createAnimation () {};
    BubbleChart.prototype.createVisual = function createVisual () {};

    return BubbleChart;
}(ScatterChart));

setDefaultOptions(BubbleChart, {
    tooltip: {
        format: "{3}"
    },
    labels: {
        format: "{3}"
    }
});

export default BubbleChart;