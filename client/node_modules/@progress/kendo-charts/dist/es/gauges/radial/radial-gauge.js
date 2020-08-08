import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { setDefaultOptions, deepExtend, round, isArray } from '../../common';
import { COORD_PRECISION } from '../../common/constants';
import Gauge from '../gauge';
import RadialScale from './radial-scale';
import RadialPointer from './radial-pointer';

var Group = drawing.Group;

var RadialGauge = (function (Gauge) {
    function RadialGauge () {
        Gauge.apply(this, arguments);
    }

    if ( Gauge ) RadialGauge.__proto__ = Gauge;
    RadialGauge.prototype = Object.create( Gauge && Gauge.prototype );
    RadialGauge.prototype.constructor = RadialGauge;

    RadialGauge.prototype.reflow = function reflow (bbox) {
        var this$1 = this;

        var pointers = this.pointers;
        this.scale.reflow(bbox);
        this._initialPlotArea = this.scale.bbox;

        for (var i = 0; i < pointers.length; i++) {
            pointers[i].reflow(this$1.scale.arc);
            this$1._initialPlotArea = geo.Rect.union(this$1._initialPlotArea, pointers[i].bbox);
        }

        this.fitScale(bbox);
        this.alignScale(bbox);
        this._buildVisual(this.gaugeArea, pointers, this.scale);
        this._draw();
    };

    RadialGauge.prototype._buildVisual = function _buildVisual (gaugeArea, pointers, scale) {
        var visuals = this._visuals = new Group();

        visuals.append(gaugeArea);
        visuals.append(scale.ticks);
        visuals.append(scale.ranges);
        this._buildPointers(pointers);
        visuals.append(scale.labelElements);
    };

    RadialGauge.prototype._buildPointers = function _buildPointers (pointers) {
        var this$1 = this;

        for (var i = 0; i < pointers.length; i++) {
            var current = pointers[i];
            current.render();
            this$1._visuals.append(current.elements);

            current.value(current.options.value);
        }
    };

    RadialGauge.prototype.fitScale = function fitScale (bbox) {
        var this$1 = this;

        var arc = this.scale.arc;
        var plotAreaBox = this._initialPlotArea;
        var step = Math.abs(this.getDiff(plotAreaBox, bbox));
        var min = round(step, COORD_PRECISION);
        var max = round(-step, COORD_PRECISION);
        var minDiff, midDiff, maxDiff, mid, oldDiff;
        var staleFlag = 0;
        var i = 0;

        while (i++ < 100) {
            staleFlag = (oldDiff === maxDiff) ? (staleFlag + 1) : 0;

            if (staleFlag > 5) {
                break;
            }

            if (min !== mid) {
                minDiff = this$1.getPlotBox(min, bbox, arc);
                if (0 <= minDiff && minDiff <= 2) {
                    break;
                }
            }

            if (max !== mid) {
                maxDiff = this$1.getPlotBox(max, bbox, arc);
                if (0 <= maxDiff && maxDiff <= 2) {
                    break;
                }
            }

            if (minDiff > 0 && maxDiff > 0) {
                mid = min * 2;
            } else if (minDiff < 0 && maxDiff < 0) {
                mid = max * 2;
            } else {
                mid = round(((min + max) / 2) || 1, COORD_PRECISION);
            }

            midDiff = this$1.getPlotBox(mid, bbox, arc);
            if (0 <= midDiff && midDiff <= 2) {
                break;
            }

            oldDiff = maxDiff;

            if (midDiff > 0) {
                max = mid;
                maxDiff = midDiff;
            } else {
                min = mid;
                minDiff = midDiff;
            }
        }
    };

    RadialGauge.prototype.getPlotBox = function getPlotBox (step, bbox, arc) {
        var this$1 = this;

        var scale = this.scale;
        var pointers = this.pointers;
        var radius = arc.getRadiusX();
        var scaleArc = arc.clone();

        scaleArc.setRadiusX(radius + step).setRadiusY(radius + step);

        scale.arc = scaleArc;
        scale.reflow(bbox);
        this.plotBbox = scale.bbox;

        for (var i = 0; i < pointers.length; i++) {
            pointers[i].reflow(scaleArc);
            this$1.plotBbox = geo.Rect.union(this$1.plotBbox, pointers[i].bbox);
        }

        return this.getDiff(this.plotBbox, bbox);
    };

    RadialGauge.prototype.getDiff = function getDiff (plotBox, box) {
        return Math.min(box.width() - plotBox.width(), box.height() - plotBox.height());
    };

    RadialGauge.prototype.alignScale = function alignScale (bbox) {
        var this$1 = this;

        var plotBoxCenter = this.plotBbox.center();
        var boxCenter = bbox.center();
        var paddingX = plotBoxCenter.x - boxCenter.x;
        var paddingY = plotBoxCenter.y - boxCenter.y;
        var ref = this;
        var scale = ref.scale;
        var pointers = ref.pointers;

        scale.arc.center.x -= paddingX;
        scale.arc.center.y -= paddingY;

        scale.reflow(bbox);

        for (var i = 0; i < pointers.length; i++) {
            pointers[i].reflow(scale.arc);
            this$1.plotBbox = geo.Rect.union(scale.bbox, pointers[i].bbox);
        }
    };

    RadialGauge.prototype._createModel = function _createModel () {
        var this$1 = this;

        var options = this.options;
        var pointers = options.pointer;
        var scale = this.scale = new RadialScale(options.scale, this.contextService);

        this.pointers = [];

        var pointersArr = isArray(pointers) ? pointers : [ pointers ];
        for (var i = 0; i < pointersArr.length; i++) {
            var current = new RadialPointer(scale, deepExtend({}, pointersArr[i], {
                animation: {
                    transitions: options.transitions
                }
            }));

            this$1.pointers.push(current);
        }
    };

    return RadialGauge;
}(Gauge));

setDefaultOptions(RadialGauge, {
    transitions: true,
    gaugeArea: {
        background: ""
    }
});

export default RadialGauge;