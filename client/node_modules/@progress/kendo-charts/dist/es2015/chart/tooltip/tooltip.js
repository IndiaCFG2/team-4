import BaseTooltip from './base-tooltip';

import { deepExtend } from '../../common';

class Tooltip extends BaseTooltip {
    show(point) {
        if (!point || !point.tooltipAnchor || (this._current && this._current === point)) {
            return;
        }

        const options = deepExtend({}, this.options, point.options.tooltip);
        const anchor = point.tooltipAnchor();

        if (anchor) {
            this._current = point;
            super.show({
                point: point,
                anchor: anchor
            }, options, point);
        } else {
            this.hide();
        }
    }

    hide() {
        delete this._current;
        super.hide();
    }
}

export default Tooltip;