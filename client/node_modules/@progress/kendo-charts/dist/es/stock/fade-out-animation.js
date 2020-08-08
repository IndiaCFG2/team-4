import { drawing as draw } from '@progress/kendo-drawing';

import { interpolateValue, elementStyles } from '../common';

var FadeOutAnimation = (function (superclass) {
    function FadeOutAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) FadeOutAnimation.__proto__ = superclass;
    FadeOutAnimation.prototype = Object.create( superclass && superclass.prototype );
    FadeOutAnimation.prototype.constructor = FadeOutAnimation;

    FadeOutAnimation.prototype.setup = function setup () {
        this._initialOpacity = parseFloat(elementStyles(this.element, 'opacity').opacity);
    };

    FadeOutAnimation.prototype.step = function step (pos) {
        elementStyles(this.element, {
            opacity: String(interpolateValue(this._initialOpacity, 0, pos))
        });
    };

    FadeOutAnimation.prototype.abort = function abort () {
        superclass.prototype.abort.call(this);
        elementStyles(this.element, {
            display: 'none',
            opacity: String(this._initialOpacity)
        });
    };

    FadeOutAnimation.prototype.cancel = function cancel () {
        superclass.prototype.abort.call(this);
        elementStyles(this.element, {
            opacity: String(this._initialOpacity)
        });
    };

    return FadeOutAnimation;
}(draw.Animation));

export default FadeOutAnimation;