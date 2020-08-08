import { ChartElement, Box } from '../../core';

import ClipAnimationMixin from '../mixins/clip-animation-mixin';
import ErrorRangeCalculator from '../error-bars/error-range-calculator';
import ScatterErrorBar from '../error-bars/scatter-error-bar';
import LinePoint from '../line-chart/line-point';
import CategoricalChart from '../categorical-chart';

import hasValue from '../utils/has-value';
import evalOptions from '../utils/eval-options';

import { deepExtend, isNumber, isString, defined, isFunction, setDefaultOptions } from '../../common';
import { X, Y, MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { parseDate } from '../../date-utils';

class ScatterChart extends ChartElement {
    constructor(plotArea, options) {

        super(options);

        this.plotArea = plotArea;
        this.chartService = plotArea.chartService;
        this._initFields();

        this.render();
    }

    _initFields() {
        // X and Y axis ranges grouped by name, e.g.:
        // primary: { min: 0, max: 1 }
        this.xAxisRanges = {};
        this.yAxisRanges = {};

        this.points = [];
        this.seriesPoints = [];
        this.seriesOptions = [];
        this._evalSeries = [];
    }

    render() {
        this.traverseDataPoints(this.addValue.bind(this));
    }

    addErrorBar(point, field, fields) {
        const value = point.value[field];
        const valueErrorField = field + "Value";
        const lowField = field + "ErrorLow";
        const highField = field + "ErrorHigh";
        const { seriesIx, series } = fields;
        const errorBars = point.options.errorBars;
        const lowValue = fields[lowField];
        const highValue = fields[highField];

        if (isNumber(value)) {
            let errorRange;
            if (isNumber(lowValue) && isNumber(highValue)) {
                errorRange = { low: lowValue, high: highValue };
            }

            if (errorBars && defined(errorBars[valueErrorField])) {
                this.seriesErrorRanges = this.seriesErrorRanges || { x: [], y: [] };
                this.seriesErrorRanges[field][seriesIx] = this.seriesErrorRanges[field][seriesIx] ||
                    new ErrorRangeCalculator(errorBars[valueErrorField], series, field);

                errorRange = this.seriesErrorRanges[field][seriesIx].getErrorRange(value, errorBars[valueErrorField]);
            }

            if (errorRange) {
                this.addPointErrorBar(errorRange, point, field);
            }
        }
    }

    addPointErrorBar(errorRange, point, field) {
        const { low, high } = errorRange;
        const { series, options: { errorBars: options } } = point;
        const isVertical = field === Y;
        const item = {};

        point[field + "Low"] = low;
        point[field + "High"] = high;

        point.errorBars = point.errorBars || [];
        const errorBar = new ScatterErrorBar(low, high, isVertical, this, series, options);
        point.errorBars.push(errorBar);
        point.append(errorBar);

        item[field] = low;
        this.updateRange(item, series);
        item[field] = high;
        this.updateRange(item, series);
    }

    addValue(value, fields) {
        const { x, y } = value;
        const seriesIx = fields.seriesIx;
        const series = this.options.series[seriesIx];
        const missingValues = this.seriesMissingValues(series);
        const seriesPoints = this.seriesPoints[seriesIx];

        let pointValue = value;
        if (!(hasValue(x) && hasValue(y))) {
            pointValue = this.createMissingValue(pointValue, missingValues);
        }

        let point;
        if (pointValue) {
            point = this.createPoint(pointValue, fields);
            if (point) {
                Object.assign(point, fields);
                this.addErrorBar(point, X, fields);
                this.addErrorBar(point, Y, fields);
            }
            this.updateRange(pointValue, fields.series);
        }

        this.points.push(point);
        seriesPoints.push(point);
    }

    seriesMissingValues(series) {
        return series.missingValues;
    }

    createMissingValue() {}

    updateRange(value, series) {
        const intlService = this.chartService.intl;
        const { xAxis: xAxisName, yAxis: yAxisName } = series;
        let { x, y } = value;
        let xAxisRange = this.xAxisRanges[xAxisName];
        let yAxisRange = this.yAxisRanges[yAxisName];

        if (hasValue(x)) {
            xAxisRange = this.xAxisRanges[xAxisName] =
                xAxisRange || { min: MAX_VALUE, max: MIN_VALUE };

            if (isString(x)) {
                x = parseDate(intlService, x);
            }

            xAxisRange.min = Math.min(xAxisRange.min, x);
            xAxisRange.max = Math.max(xAxisRange.max, x);
        }

        if (hasValue(y)) {
            yAxisRange = this.yAxisRanges[yAxisName] =
                yAxisRange || { min: MAX_VALUE, max: MIN_VALUE };

            if (isString(y)) {
                y = parseDate(intlService, y);
            }

            yAxisRange.min = Math.min(yAxisRange.min, y);
            yAxisRange.max = Math.max(yAxisRange.max, y);
        }
    }

    evalPointOptions(options, value, fields) {
        const { series, seriesIx } = fields;
        const state = { defaults: series._defaults, excluded: [ "data", "tooltip", "content", "template", "visual", "toggle", "_outOfRangeMinPoint", "_outOfRangeMaxPoint" ] };

        let doEval = this._evalSeries[seriesIx];
        if (!defined(doEval)) {
            this._evalSeries[seriesIx] = doEval = evalOptions(options, {}, state, true);
        }

        let pointOptions = options;
        if (doEval) {
            pointOptions = deepExtend({}, options);
            evalOptions(pointOptions, {
                value: value,
                series: series,
                dataItem: fields.dataItem
            }, state);
        }

        return pointOptions;
    }

    pointType() {
        return LinePoint;
    }

    pointOptions(series, seriesIx) {
        let options = this.seriesOptions[seriesIx];
        if (!options) {
            const defaults = this.pointType().prototype.defaults;
            this.seriesOptions[seriesIx] = options = deepExtend({}, defaults, {
                markers: {
                    opacity: series.opacity
                },
                tooltip: {
                    format: this.options.tooltip.format
                },
                labels: {
                    format: this.options.labels.format
                }
            }, series);
        }

        return options;
    }

    createPoint(value, fields) {
        const series = fields.series;
        let pointOptions = this.pointOptions(series, fields.seriesIx);
        let color = fields.color || series.color;

        pointOptions = this.evalPointOptions(pointOptions, value, fields);

        if (isFunction(series.color)) {
            color = pointOptions.color;
        }

        const point = new LinePoint(value, pointOptions);
        point.color = color;

        this.append(point);

        return point;
    }

    seriesAxes(series) {
        const { xAxis: xAxisName, yAxis: yAxisName } = series;
        const plotArea = this.plotArea;
        const xAxis = xAxisName ? plotArea.namedXAxes[xAxisName] : plotArea.axisX;
        const yAxis = yAxisName ? plotArea.namedYAxes[yAxisName] : plotArea.axisY;

        if (!xAxis) {
            throw new Error("Unable to locate X axis with name " + xAxisName);
        }

        if (!yAxis) {
            throw new Error("Unable to locate Y axis with name " + yAxisName);
        }

        return {
            x: xAxis,
            y: yAxis
        };
    }

    reflow(targetBox) {
        const chartPoints = this.points;
        const limit = !this.options.clip;
        let pointIx = 0;


        this.traverseDataPoints((value, fields) => {
            const point = chartPoints[pointIx++];
            const seriesAxes = this.seriesAxes(fields.series);
            const slotX = seriesAxes.x.getSlot(value.x, value.x, limit);
            const slotY = seriesAxes.y.getSlot(value.y, value.y, limit);

            if (point) {
                if (slotX && slotY) {
                    const pointSlot = this.pointSlot(slotX, slotY);
                    point.reflow(pointSlot);
                } else {
                    point.visible = false;
                }
            }
        });

        this.box = targetBox;
    }

    pointSlot(slotX, slotY) {
        return new Box(slotX.x1, slotY.y1, slotX.x2, slotY.y2);
    }

    traverseDataPoints(callback) {
        const { options: { series }, seriesPoints } = this;

        for (let seriesIx = 0; seriesIx < series.length; seriesIx++) {
            const currentSeries = series[seriesIx];
            const currentSeriesPoints = seriesPoints[seriesIx];
            if (!currentSeriesPoints) {
                seriesPoints[seriesIx] = [];
            }

            for (let pointIx = 0; pointIx < currentSeries.data.length; pointIx++) {
                const { valueFields: value, fields } = this._bindPoint(currentSeries, seriesIx, pointIx);

                callback(value, deepExtend({
                    pointIx: pointIx,
                    series: currentSeries,
                    seriesIx: seriesIx,
                    dataItem: currentSeries.data[pointIx],
                    owner: this
                }, fields));
            }
        }
    }

    formatPointValue(point, format) {
        const value = point.value;
        return this.chartService.format.auto(format, value.x, value.y);
    }

    animationPoints() {
        const points = this.points;
        const result = [];
        for (let idx = 0; idx < points.length; idx++) {
            result.push((points[idx] || {}).marker);
        }
        return result;
    }
}
setDefaultOptions(ScatterChart, {
    series: [],
    tooltip: {
        format: "{0}, {1}"
    },
    labels: {
        format: "{0}, {1}"
    },
    clip: true
});
deepExtend(ScatterChart.prototype, ClipAnimationMixin, {
    _bindPoint: CategoricalChart.prototype._bindPoint
});

export default ScatterChart;