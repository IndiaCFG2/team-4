import { drawing as draw } from '@progress/kendo-drawing';

import ClipAnimation from '../animations/clip-animation';
import anyHasZIndex from '../utils/any-has-z-index';
import { defined } from '../../common';

var ClipAnimationMixin = {
    createAnimation: function() {
        var root = this.getRoot();
        if (root && (root.options || {}).transitions !== false) {
            var box = root.size();
            var clipPath = draw.Path.fromRect(box.toRect());
            this.visual.clip(clipPath);
            this.animation = new ClipAnimation(clipPath, {
                box: box
            });
            if (anyHasZIndex(this.options.series)) {
                this._setChildrenAnimation(clipPath);
            }
        }
    },

    _setChildrenAnimation: function(clipPath) {
        var points = this.animationPoints();

        for (var idx = 0; idx < points.length; idx++) {
            var point = points[idx];
            if (point && point.visual && defined(point.visual.options.zIndex)) {
                point.visual.clip(clipPath);
            }
        }
    }
};

export default ClipAnimationMixin;