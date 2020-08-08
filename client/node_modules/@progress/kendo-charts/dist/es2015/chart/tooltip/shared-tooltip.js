import BaseTooltip from './base-tooltip';
import { Point } from '../../core';

import { grep, setDefaultOptions } from '../../common';

class SharedTooltip extends BaseTooltip {
    constructor(plotArea, options) {
        super(plotArea.chartService, options);

        this.plotArea = plotArea;
        this.formatService = plotArea.chartService.format;
    }

    showAt(points, coords) {
        const tooltipPoints = grep(points, function(point) {
            const tooltip = point.series.tooltip;
            const excluded = tooltip && tooltip.visible === false;

            return !excluded;
        });

        if (tooltipPoints.length > 0) {
            const point = tooltipPoints[0];
            const slot = this.plotArea.categoryAxis.getSlot(point.categoryIx);

            const anchor = coords ? this._slotAnchor(coords, slot) : this._defaultAnchor(point, slot);

            this.show({
                anchor: anchor,
                shared: true,
                points: points,
                category: point.category,
                categoryText: this.formatService.auto(this.options.categoryFormat, point.category),
                series: this.plotArea.series
            }, this.options);
        }
    }

    _slotAnchor(point, slot) {
        const axis = this.plotArea.categoryAxis;
        const align = {
            horizontal: "left",
            vertical: "center"
        };

        if (!axis.options.vertical) {
            point.x = slot.center().x;
        }

        return {
            point: point,
            align: align
        };
    }

    _defaultAnchor(point, slot) {
        const box = point.owner.pane.chartsBox();
        const vertical = this.plotArea.categoryAxis.options.vertical;
        const center = box.center();
        const slotCenter = slot.center();
        const align = {
            horizontal: "center",
            vertical: "center"
        };

        let centerPoint;
        if (vertical) {
            centerPoint = new Point(center.x, slotCenter.y);
        } else {
            centerPoint = new Point(slotCenter.x, center.y);
        }

        return {
            point: centerPoint,
            align: align
        };
    }
}

setDefaultOptions(SharedTooltip, {
    categoryFormat: '{0:d}'
});

export default SharedTooltip;