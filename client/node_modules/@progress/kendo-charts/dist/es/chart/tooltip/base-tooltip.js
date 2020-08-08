import { Color } from '@progress/kendo-drawing';

import { Class, defined, deepExtend, setDefaultOptions, valueOrDefault, getSpacing, styleValue } from '../../common';
import { SHOW_TOOLTIP, HIDE_TOOLTIP } from '../constants';

var BaseTooltip = (function (Class) {
    function BaseTooltip(chartService, options) {
        Class.call(this);

        this.chartService = chartService;
        this.options = deepExtend({}, this.options, options);
    }

    if ( Class ) BaseTooltip.__proto__ = Class;
    BaseTooltip.prototype = Object.create( Class && Class.prototype );
    BaseTooltip.prototype.constructor = BaseTooltip;

    BaseTooltip.prototype.getStyle = function getStyle (options, point) {
        var background = options.background;
        var border = options.border.color;

        if (point) {
            var pointColor = point.color || point.options.color;
            background = valueOrDefault(background, pointColor);
            border = valueOrDefault(border, pointColor);
        }

        var padding = getSpacing(options.padding || {}, "auto");

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
    };

    BaseTooltip.prototype.show = function show (options, tooltipOptions, point) {
        options.format = tooltipOptions.format;

        var style = this.getStyle(tooltipOptions, point);
        options.style = style;

        if (!defined(tooltipOptions.color) && new Color(style.backgroundColor).percBrightness() > 180) {
            options.className = "k-chart-tooltip-inverse";
        }

        this.chartService.notify(SHOW_TOOLTIP, options);

        this.visible = true;
    };

    BaseTooltip.prototype.hide = function hide () {
        if (this.chartService) {
            this.chartService.notify(HIDE_TOOLTIP);
        }

        this.visible = false;
    };

    BaseTooltip.prototype.destroy = function destroy () {
        delete this.chartService;
    };

    return BaseTooltip;
}(Class));

setDefaultOptions(BaseTooltip, {
    border: {
        width: 1
    },
    opacity: 1
});

export default BaseTooltip;
