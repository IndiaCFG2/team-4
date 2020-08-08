import { ChartElement, Box } from '../../core';

import { X, Y } from '../../common/constants';
import { setDefaultOptions } from '../../common';

var StackWrap = (function (ChartElement) {
    function StackWrap () {
        ChartElement.apply(this, arguments);
    }

    if ( ChartElement ) StackWrap.__proto__ = ChartElement;
    StackWrap.prototype = Object.create( ChartElement && ChartElement.prototype );
    StackWrap.prototype.constructor = StackWrap;

    StackWrap.prototype.reflow = function reflow (targetBox) {
        var this$1 = this;

        var positionAxis = this.options.vertical ? X : Y;
        var children = this.children;
        var childrenCount = children.length;
        var box = this.box = new Box();

        for (var i = 0; i < childrenCount; i++) {
            var currentChild = children[i];

            if (currentChild.visible !== false) {
                var childBox = currentChild.box.clone();
                childBox.snapTo(targetBox, positionAxis);

                if (i === 0) {
                    box = this$1.box = childBox.clone();
                }

                currentChild.reflow(childBox);
                box.wrap(childBox);
            }
        }
    };

    return StackWrap;
}(ChartElement));

setDefaultOptions(StackWrap, {
    vertical: true
});

export default StackWrap;