
import CategoricalChart from '../categorical-chart';
import BarChart from '../bar-chart/bar-chart';
import Bullet from './bullet';
import ClusterLayout from '../layout/cluster-layout';
import { BAR } from '../constants';

import { MIN_VALUE, MAX_VALUE } from '../../common/constants';
import { deepExtend, defined, isArray, isFunction, isObject, setDefaultOptions } from '../../common';

var BulletChart = (function (CategoricalChart) {
    function BulletChart(plotArea, options) {

        wrapData(options);

        CategoricalChart.call(this, plotArea, options);
    }

    if ( CategoricalChart ) BulletChart.__proto__ = CategoricalChart;
    BulletChart.prototype = Object.create( CategoricalChart && CategoricalChart.prototype );
    BulletChart.prototype.constructor = BulletChart;

    BulletChart.prototype.reflowCategories = function reflowCategories (categorySlots) {
        var children = this.children;
        var childrenLength = children.length;

        for (var i = 0; i < childrenLength; i++) {
            children[i].reflow(categorySlots[i]);
        }
    };

    BulletChart.prototype.plotRange = function plotRange (point) {
        var series = point.series;
        var valueAxis = this.seriesValueAxis(series);
        var axisCrossingValue = this.categoryAxisCrossingValue(valueAxis);

        return [ axisCrossingValue, point.value.current || axisCrossingValue ];
    };

    BulletChart.prototype.createPoint = function createPoint (data, fields) {
        var categoryIx = fields.categoryIx;
        var category = fields.category;
        var series = fields.series;
        var seriesIx = fields.seriesIx;
        var ref = this;
        var options = ref.options;
        var children = ref.children;
        var value = data.valueFields;

        var bulletOptions = deepExtend({
            vertical: !options.invertAxes,
            overlay: series.overlay,
            categoryIx: categoryIx,
            invertAxes: options.invertAxes
        }, series);

        var color = data.fields.color || series.color;
        bulletOptions = this.evalPointOptions(
            bulletOptions, value, category, categoryIx, series, seriesIx
        );

        if (isFunction(series.color)) {
            color = bulletOptions.color;
        }

        var bullet = new Bullet(value, bulletOptions);
        bullet.color = color;

        var cluster = children[categoryIx];
        if (!cluster) {
            cluster = new ClusterLayout({
                vertical: options.invertAxes,
                gap: options.gap,
                spacing: options.spacing,
                rtl: !options.invertAxes && (this.chartService || {}).rtl
            });
            this.append(cluster);
        }

        cluster.append(bullet);

        return bullet;
    };

    BulletChart.prototype.updateRange = function updateRange (value, fields) {
        var current = value.current;
        var target = value.target;
        var axisName = fields.series.axis;
        var axisRange = this.valueAxisRanges[axisName];

        if (defined(current) && !isNaN(current) && defined(target && !isNaN(target))) {
            axisRange = this.valueAxisRanges[axisName] =
                axisRange || { min: MAX_VALUE, max: MIN_VALUE };

            axisRange.min = Math.min(axisRange.min, current, target);
            axisRange.max = Math.max(axisRange.max, current, target);
        }
    };

    BulletChart.prototype.formatPointValue = function formatPointValue (point, format) {
        return this.chartService.format.auto(format, point.value.current, point.value.target);
    };

    BulletChart.prototype.pointValue = function pointValue (data) {
        return data.valueFields.current;
    };

    BulletChart.prototype.aboveAxis = function aboveAxis (point) {
        var value = point.value.current;

        return value > 0;
    };

    BulletChart.prototype.createAnimation = function createAnimation () {
        var this$1 = this;

        var points = this.points;

        this._setAnimationOptions();

        for (var idx = 0; idx < points.length; idx++) {
            var point = points[idx];
            point.options.animation = this$1.options.animation;
            point.createAnimation();
        }
    };

    return BulletChart;
}(CategoricalChart));

BulletChart.prototype._setAnimationOptions = BarChart.prototype._setAnimationOptions;

setDefaultOptions(BulletChart, {
    animation: {
        type: BAR
    }
});

function wrapData(options) {
    var series = options.series;

    for (var i = 0; i < series.length; i++) {
        var seriesItem = series[i];
        var data = seriesItem.data;
        if (data && !isArray(data[0]) && !isObject(data[0])) {
            seriesItem.data = [ data ];
        }
    }
}

export default BulletChart;