import { Class, deepExtend, elementStyles, getTemplate, setDefaultOptions } from '../common';
import { toDate, toTime } from '../date-utils';
import FadeOutAnimation from './fade-out-animation';

function createDiv(className, style) {
    const div = document.createElement("div");
    div.className = className;
    if (style) {
        div.style.cssText = style;
    }

    return div;
}

class NavigatorHint extends Class {
    constructor(container, chartService, options) {
        super();

        this.options = deepExtend({}, this.options, options);
        this.container = container;
        this.chartService = chartService;

        const padding = elementStyles(container, [ "paddingLeft", "paddingTop" ]);
        this.chartPadding = {
            top: padding.paddingTop,
            left: padding.paddingLeft
        };

        this.createElements();
        container.appendChild(this.element);
    }

    createElements() {
        const element = this.element = createDiv('k-navigator-hint', 'display: none; position: absolute; top: 1px; left: 1px;');
        const tooltip = this.tooltip = createDiv('k-tooltip k-chart-tooltip');
        const scroll = this.scroll = createDiv('k-scroll');

        tooltip.innerHTML = '&nbsp;';

        element.appendChild(tooltip);
        element.appendChild(scroll);
    }

    show(from, to, bbox) {
        const { element, options, scroll, tooltip } = this;
        const middle = toDate(toTime(from) + toTime(to - from) / 2);
        const scrollWidth = bbox.width() * 0.4;
        const minPos = bbox.center().x - scrollWidth;
        const maxPos = bbox.center().x;
        const posRange = maxPos - minPos;
        const range = options.max - options.min;
        const scale = posRange / range;
        const offset = middle - options.min;
        let text = this.chartService.intl.format(options.format, from, to);
        const template = getTemplate(options);

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

        const tooltipStyle = elementStyles(tooltip, [ 'marginTop', 'borderTopWidth', 'height' ]);

        elementStyles(scroll, {
            width: scrollWidth,
            left: minPos + offset * scale,
            top: bbox.y1 + tooltipStyle.marginTop + tooltipStyle.borderTopWidth + tooltipStyle.height / 2
        });

        elementStyles(element, {
            visibility: 'visible'
        });
    }

    clearHideTimeout() {
        if (this._hideTimeout) {
            clearTimeout(this._hideTimeout);
        }

        if (this._hideAnimation) {
            this._hideAnimation.cancel();
        }
    }

    hide() {
        this.clearHideTimeout();

        this._hideTimeout = setTimeout(() => {
            this._visible = false;
            this._hideAnimation = new FadeOutAnimation(this.element);
            this._hideAnimation.setup();
            this._hideAnimation.play();
        }, this.options.hideDelay);
    }

    destroy() {
        this.clearHideTimeout();
        if (this.container) {
            this.container.removeChild(this.element);
        }
        delete this.container;
        delete this.chartService;
        delete this.element;
        delete this.tooltip;
        delete this.scroll;
    }
}

setDefaultOptions(NavigatorHint, {
    format: "{0:d} - {1:d}",
    hideDelay: 500
});

export default NavigatorHint;