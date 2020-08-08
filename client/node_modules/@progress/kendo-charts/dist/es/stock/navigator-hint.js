import { Class, deepExtend, elementStyles, getTemplate, setDefaultOptions } from '../common';
import { toDate, toTime } from '../date-utils';
import FadeOutAnimation from './fade-out-animation';

function createDiv(className, style) {
    var div = document.createElement("div");
    div.className = className;
    if (style) {
        div.style.cssText = style;
    }

    return div;
}

var NavigatorHint = (function (Class) {
    function NavigatorHint(container, chartService, options) {
        Class.call(this);

        this.options = deepExtend({}, this.options, options);
        this.container = container;
        this.chartService = chartService;

        var padding = elementStyles(container, [ "paddingLeft", "paddingTop" ]);
        this.chartPadding = {
            top: padding.paddingTop,
            left: padding.paddingLeft
        };

        this.createElements();
        container.appendChild(this.element);
    }

    if ( Class ) NavigatorHint.__proto__ = Class;
    NavigatorHint.prototype = Object.create( Class && Class.prototype );
    NavigatorHint.prototype.constructor = NavigatorHint;

    NavigatorHint.prototype.createElements = function createElements () {
        var element = this.element = createDiv('k-navigator-hint', 'display: none; position: absolute; top: 1px; left: 1px;');
        var tooltip = this.tooltip = createDiv('k-tooltip k-chart-tooltip');
        var scroll = this.scroll = createDiv('k-scroll');

        tooltip.innerHTML = '&nbsp;';

        element.appendChild(tooltip);
        element.appendChild(scroll);
    };

    NavigatorHint.prototype.show = function show (from, to, bbox) {
        var ref = this;
        var element = ref.element;
        var options = ref.options;
        var scroll = ref.scroll;
        var tooltip = ref.tooltip;
        var middle = toDate(toTime(from) + toTime(to - from) / 2);
        var scrollWidth = bbox.width() * 0.4;
        var minPos = bbox.center().x - scrollWidth;
        var maxPos = bbox.center().x;
        var posRange = maxPos - minPos;
        var range = options.max - options.min;
        var scale = posRange / range;
        var offset = middle - options.min;
        var text = this.chartService.intl.format(options.format, from, to);
        var template = getTemplate(options);

        this.clearHideTimeout();

        if (!this._visible) {
            elementStyles(element, {
                visibility: 'hidden',
                display: 'block'
            });
            this._visible = true;
        }

        if (template) {
            text = template({
                from: from,
                to: to
            });
        }

        tooltip.innerHTML = text;
        elementStyles(tooltip, {
            left: bbox.center().x - tooltip.offsetWidth / 2,
            top: bbox.y1
        });

        var tooltipStyle = elementStyles(tooltip, [ 'marginTop', 'borderTopWidth', 'height' ]);

        elementStyles(scroll, {
            width: scrollWidth,
            left: minPos + offset * scale,
            top: bbox.y1 + tooltipStyle.marginTop + tooltipStyle.borderTopWidth + tooltipStyle.height / 2
        });

        elementStyles(element, {
            visibility: 'visible'
        });
    };

    NavigatorHint.prototype.clearHideTimeout = function clearHideTimeout () {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }

        if (this._hideAnimation) {
            this._hideAnimation.cancel();
        }
    };

    NavigatorHint.prototype.hide = function hide () {
        var this$1 = this;

        this.clearHideTimeout();

        this._hideTimeout = setTimeout(function () {
            this$1._visible = false;
            this$1._hideAnimation = new FadeOutAnimation(this$1.element);
            this$1._hideAnimation.setup();
            this$1._hideAnimation.play();
        }, this.options.hideDelay);
    };

    NavigatorHint.prototype.destroy = function destroy () {
        this.clearHideTimeout();
        if (this.container) {
            this.container.removeChild(this.element);
        }
        delete this.container;
        delete this.chartService;
        delete this.element;
        delete this.tooltip;
        delete this.scroll;
    };

    return NavigatorHint;
}(Class));

setDefaultOptions(NavigatorHint, {
    format: "{0:d} - {1:d}",
    hideDelay: 500
});

export default NavigatorHint;