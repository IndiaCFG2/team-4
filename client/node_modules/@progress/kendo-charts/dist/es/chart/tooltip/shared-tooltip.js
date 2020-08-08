import BaseTooltip from './base-tooltip';
import { Point } from '../../core';

import { grep, setDefaultOptions } from '../../common';

var SharedTooltip = (function (BaseTooltip) {
    function SharedTooltip(plotArea, options) {
        BaseTooltip.call(this, plotArea.chartService, options);

        this.plotArea = plotArea;
        this.formatService = plotArea.chartService.format;
    }

    if ( BaseTooltip ) SharedTooltip.__proto__ = BaseTooltip;
    SharedTooltip.prototype = Object.create( BaseTooltip && BaseTooltip.prototype );
    SharedTooltip.prototype.constructor = SharedTooltip;

    SharedTooltip.prototype.showAt = function showAt (points, coords) {
        var tooltipPoints = grep(points, function(point) {
            var tooltip = point.series.tooltip;
            var excluded = tooltip && tooltip.visible === false;

            return !excluded;
        });

        if (tooltipPoints.length > 0) {
            var point = tooltipPoints[0];
            var slot = this.plotArea.categoryAxis.getSlot(point.categoryIx);

            var anchor = coords ? this._slotAnchor(coords, slot) : this._defaultAnchor(point, slot);

            this.show({
                anchor: anchor,
                shared: true,
                points: points,
                category: point.category,
                categoryText: this.formatService.auto(this.options.categoryFormat, point.category),
                series: this.plotArea.series
            }, this.options);
        }
    };

    SharedTooltip.prototype._slotAnchor = function _slotAnchor (point, slot) {
        var axis = this.plotArea.categoryAxis;
        var align = {
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
    };

    SharedTooltip.prototype._defaultAnchor = function _defaultAnchor (point, slot) {
        var box = point.owner.pane.chartsBox();
        var vertical = this.plotArea.categoryAxis.options.vertical;
        var center = box.center();
        var slotCenter = slot.center();
        var align = {
            horizontal: "center",
            vertical: "center"
        };

        var centerPoint;
        if (vertical) {
            centerPoint = new Point(center.x, slotCenter.y);
        } else {
            centerPoint = new Point(slotCenter.x, center.y);
        }

        return {
            point: centerPoint,
            align: align
        };
    };

    return SharedTooltip;
}(BaseTooltip));

setDefaultOptions(SharedTooltip, {
    categoryFormat: '{0:d}'
});

export default SharedTooltip;