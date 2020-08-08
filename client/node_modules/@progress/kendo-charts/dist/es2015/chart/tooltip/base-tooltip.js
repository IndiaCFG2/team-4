import { Color } from '@progress/kendo-drawing';

import { Class, defined, deepExtend, setDefaultOptions, valueOrDefault, getSpacing, styleValue } from '../../common';
import { SHOW_TOOLTIP, HIDE_TOOLTIP } from '../constants';

class BaseTooltip extends Class {
    constructor(chartService, options) {
        super();

        this.chartService = chartService;
        this.options = deepExtend({}, this.options, options);
    }

    getStyle(options, point) {
        let { background, border: { color: border } } = options;

        if (point) {
            const pointColor = point.color || point.options.color;
            background = valueOrDefault(background, pointColor);
            border = valueOrDefault(border, pointColor);
        }

        const padding = getSpacing(options.padding || {}, "auto");

        return {
            backgroundColor: background,
            borderColor: border,
            font: options.font,
            color: options.color,
            opacity: options.opacity,
            borderWidth: styleValue(options.border.width),
            paddingTop: styleValue(padding.top),
            paddingBottom: styleValue(padding.bottom),
            paddingLeft: styleValue(padding.left),
            paddingRight: styleValue(padding.right)
        };
    }

    show(options, tooltipOptions, point) {
        options.format = tooltipOptions.format;

        const style = this.getStyle(tooltipOptions, point);
        options.style = style;

        if (!defined(tooltipOptions.color) && new Color(style.backgroundColor).percBrightness() > 180) {
            options.className = "k-chart-tooltip-inverse";
        }

        this.chartService.notify(SHOW_TOOLTIP, options);

        this.visible = true;
    }

    hide() {
        if (this.chartService) {
            this.chartService.notify(HIDE_TOOLTIP);
        }

        this.visible = false;
    }

    destroy() {
        delete this.chartService;
    }
}

setDefaultOptions(BaseTooltip, {
    border: {
        width: 1
    },
    opacity: 1
});

export default BaseTooltip;
