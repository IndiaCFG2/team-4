import BaseTooltip from './base-tooltip';

import { deepExtend } from '../../common';

var Tooltip = (function (BaseTooltip) {
    function Tooltip () {
        BaseTooltip.apply(this, arguments);
    }

    if ( BaseTooltip ) Tooltip.__proto__ = BaseTooltip;
    Tooltip.prototype = Object.create( BaseTooltip && BaseTooltip.prototype );
    Tooltip.prototype.constructor = Tooltip;

    Tooltip.prototype.show = function show (point) {
        if (!point || !point.tooltipAnchor || (this._current && this._current === point)) {
            return;
        }

        var options = deepExtend({}, this.options, point.options.tooltip);
        var anchor = point.tooltipAnchor();

        if (anchor) {
            this._current = point;
            BaseTooltip.prototype.show.call(this, {
                point: point,
                anchor: anchor
            }, options, point);
        } else {
            this.hide();
        }
    };

    Tooltip.prototype.hide = function hide () {
        delete this._current;
        BaseTooltip.prototype.hide.call(this);
    };

    return Tooltip;
}(BaseTooltip));

export default Tooltip;