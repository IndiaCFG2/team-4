import { drawing as draw } from '@progress/kendo-drawing';

import { interpolateValue, elementStyles } from '../common';

class FadeOutAnimation extends draw.Animation {

    setup() {
        this._initialOpacity = parseFloat(elementStyles(this.element, 'opacity').opacity);
    }

    step(pos) {
        elementStyles(this.element, {
            opacity: String(interpolateValue(this._initialOpacity, 0, pos))
        });
    }

    abort() {
        super.abort();
        elementStyles(this.element, {
            display: 'none',
            opacity: String(this._initialOpacity)
        });
    }

    cancel() {
        super.abort();
        elementStyles(this.element, {
            opacity: String(this._initialOpacity)
        });
    }
}

export default FadeOutAnimation;