import CandlestickChart from '../candlestick-chart/candlestick-chart';
import VerticalBoxPlot from './vertical-box-plot';
import BoxPlot from './box-plot';
import ClusterLayout from '../layout/cluster-layout';

import areNumbers from '../utils/are-numbers';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { defined } from '../../common';

class BoxPlotChart extends CandlestickChart {
    addValue(data, fields) {
        const { categoryIx, category, series, seriesIx } = fields;
        const { children, options } = this;
        const value = data.valueFields;
        const valueParts = this.splitValue(value);
        const hasValue = areNumbers(valueParts);
        const dataItem = series.data[categoryIx];
        let categoryPoints = this.categoryPoints[categoryIx];
        let point;

        if (!categoryPoints) {
            this.categoryPoints[categoryIx] = categoryPoints = [];
        }

        if (hasValue) {
            point = this.createPoint(data, fields);
        }

        let cluster = children[categoryIx];
        if (!cluster) {
            cluster = new ClusterLayout({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        if (point) {
            this.updateRange(value, fields);

            cluster.append(point);

            point.categoryIx = categoryIx;
            point.category = category;
            point.series = series;
            point.seriesIx = seriesIx;
            point.owner = this;
            point.dataItem = dataItem;
        }

        this.points.push(point);
        categoryPoints.push(point);
    }

    pointType() {
        if (this.options.invertAxes) {
            return VerticalBoxPlot;
        }

        return BoxPlot;
    }

    splitValue(value) {
        return [
            value.lower, value.q1, value.median,
            value.q3, value.upper
        ];
    }

    updateRange(value, fields) {
        const axisName = fields.series.axis;
        let axisRange = this.valueAxisRanges[axisName];
        let parts = this.splitValue(value).concat(this.filterOutliers(value.outliers));

        if (defined(value.mean)) {
            parts = parts.concat(value.mean);
        }

        axisRange = this.valueAxisRanges[axisName] =
            axisRange || { min: MAX_VALUE, max: MIN_VALUE };

        axisRange = this.valueAxisRanges[axisName] = {
            min: Math.min.apply(Math, parts.concat([ axisRange.min ])),
            max: Math.max.apply(Math, parts.concat([ axisRange.max ]))
        };
    }

    formatPointValue(point, format) {
        const value = point.value;

        return this.chartService.format.auto(format,
            value.lower, value.q1, value.median,
            value.q3, value.upper, value.mean, point.category
        );
    }

    filterOutliers(items) {
        const length = (items || []).length;
        const result = [];

        for (let i = 0; i < length; i++) {
            const item = items[i];
            if (defined(item) && item !== null) {
                result.push(item);
            }
        }

        return result;
    }
}

export default BoxPlotChart;