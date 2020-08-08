import { SharedTooltip as ChartSharedTooltip } from '../chart';
import { Point } from '../core';
var TOP_OFFSET = -2;

var SharedTooltip = (function (ChartSharedTooltip) {
    function SharedTooltip () {
        ChartSharedTooltip.apply(this, arguments);
    }

    if ( ChartSharedTooltip ) SharedTooltip.__proto__ = ChartSharedTooltip;
    SharedTooltip.prototype = Object.create( ChartSharedTooltip && ChartSharedTooltip.prototype );
    SharedTooltip.prototype.constructor = SharedTooltip;

    SharedTooltip.prototype._slotAnchor = function _slotAnchor (coords, slot) {
        var axis = this.plotArea.categoryAxis;
        var vertical = axis.options.vertical;
        var align = vertical ? {
            horizontal: "left",
            vertical: "center"
        } : {
            horizontal: "center",
            vertical: "bottom"
        };

        var point;

        if (vertical) {
            point = new Point(this.plotArea.box.x2, slot.center().y);
        } else {
            point = new Point(slot.center().x, TOP_OFFSET);
        }

        return {
            point: point,
            align: align
        };
    };

    SharedTooltip.prototype._defaultAnchor = function _defaultAnchor (point, slot) {
        return this._slotAnchor({}, slot);
    };

    return SharedTooltip;
}(ChartSharedTooltip));

export default SharedTooltip;