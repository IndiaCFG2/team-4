import BaseTooltip from '../tooltip/base-tooltip';

import { HIDE_TOOLTIP } from '../constants';
import { TOP, BOTTOM, LEFT, RIGHT, CENTER, DATE } from '../../common/constants';
import { setDefaultOptions } from '../../common';

class CrosshairTooltip extends BaseTooltip {
    constructor(chartService, crosshair, options) {
        super(chartService, options);

        this.crosshair = crosshair;
        this.formatService = chartService.format;
        this.initAxisName();
    }

    initAxisName() {
        const axis = this.crosshair.axis;
        const plotArea = axis.plotArea;
        let name;
        if (plotArea.categoryAxis) {
            name = axis.getCategory ? "categoryAxis" : "valueAxis";
        } else {
            name = axis.options.vertical ? "yAxis" : "xAxis";
        }
        this.axisName = name;
    }

    showAt(point) {
        const { crosshair: { axis }, options } = this;
        let value = axis[options.stickyMode ? "getCategory" : "getValue"](point);
        let formattedValue = value;

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
    }

    hide() {
        this.chartService.notify(HIDE_TOOLTIP, {
            crosshair: this.crosshair,
            axisName: this.axisName,
            axisIndex: this.crosshair.axis.axisIndex
        });
    }

    getAnchor() {
        const { crosshair, options: { position, padding } } = this;
        const vertical = !crosshair.axis.options.vertical;
        const lineBox = crosshair.line.bbox();
        let horizontalAlign, verticalAlign, point;

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
    }
}

setDefaultOptions(CrosshairTooltip, {
    padding: 10
});

export default CrosshairTooltip;

