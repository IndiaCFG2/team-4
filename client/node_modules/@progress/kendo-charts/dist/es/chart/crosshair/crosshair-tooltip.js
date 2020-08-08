import BaseTooltip from '../tooltip/base-tooltip';

import { HIDE_TOOLTIP } from '../constants';
import { TOP, BOTTOM, LEFT, RIGHT, CENTER, DATE } from '../../common/constants';
import { setDefaultOptions } from '../../common';

var CrosshairTooltip = (function (BaseTooltip) {
    function CrosshairTooltip(chartService, crosshair, options) {
        BaseTooltip.call(this, chartService, options);

        this.crosshair = crosshair;
        this.formatService = chartService.format;
        this.initAxisName();
    }

    if ( BaseTooltip ) CrosshairTooltip.__proto__ = BaseTooltip;
    CrosshairTooltip.prototype = Object.create( BaseTooltip && BaseTooltip.prototype );
    CrosshairTooltip.prototype.constructor = CrosshairTooltip;

    CrosshairTooltip.prototype.initAxisName = function initAxisName () {
        var axis = this.crosshair.axis;
        var plotArea = axis.plotArea;
        var name;
        if (plotArea.categoryAxis) {
            name = axis.getCategory ? "categoryAxis" : "valueAxis";
        } else {
            name = axis.options.vertical ? "yAxis" : "xAxis";
        }
        this.axisName = name;
    };

    CrosshairTooltip.prototype.showAt = function showAt (point) {
        var ref = this;
        var axis = ref.crosshair.axis;
        var options = ref.options;
        var value = axis[options.stickyMode ? "getCategory" : "getValue"](point);
        var formattedValue = value;

        if (options.format) {
            formattedValue = this.formatService.auto(options.format, value);
        } else if (axis.options.type === DATE) {
            formattedValue = this.formatService.auto(axis.options.labels.dateFormats[axis.options.baseUnit], value);
        }

        this.show({
            point: point,
            anchor: this.getAnchor(),
            crosshair: this.crosshair,
            value: formattedValue,
            axisName: this.axisName,
            axisIndex: this.crosshair.axis.axisIndex
        }, this.options);
    };

    CrosshairTooltip.prototype.hide = function hide () {
        this.chartService.notify(HIDE_TOOLTIP, {
            crosshair: this.crosshair,
            axisName: this.axisName,
            axisIndex: this.crosshair.axis.axisIndex
        });
    };

    CrosshairTooltip.prototype.getAnchor = function getAnchor () {
        var ref = this;
        var crosshair = ref.crosshair;
        var ref_options = ref.options;
        var position = ref_options.position;
        var padding = ref_options.padding;
        var vertical = !crosshair.axis.options.vertical;
        var lineBox = crosshair.line.bbox();
        var horizontalAlign, verticalAlign, point;

        if (vertical) {
            horizontalAlign = CENTER;
            if (position === BOTTOM) {
                verticalAlign = TOP;
                point = lineBox.bottomLeft().translate(0, padding);
            } else {
                verticalAlign = BOTTOM;
                point = lineBox.topLeft().translate(0, -padding);
            }
        } else {
            verticalAlign = CENTER;
            if (position === LEFT) {
                horizontalAlign = RIGHT;
                point = lineBox.topLeft().translate(-padding, 0);
            } else {
                horizontalAlign = LEFT;
                point = lineBox.topRight().translate(padding, 0);
            }
        }

        return {
            point: point,
            align: {
                horizontal: horizontalAlign,
                vertical: verticalAlign
            }
        };
    };

    return CrosshairTooltip;
}(BaseTooltip));

setDefaultOptions(CrosshairTooltip, {
    padding: 10
});

export default CrosshairTooltip;

