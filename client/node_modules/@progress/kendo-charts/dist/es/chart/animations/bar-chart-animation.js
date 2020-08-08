import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import { INITIAL_ANIMATION_DURATION, BAR, START_SCALE } from '../constants';

import { X, Y } from '../../common/constants';
import { interpolateValue, setDefaultOptions } from '../../common';

var BarChartAnimation = (function (superclass) {
    function BarChartAnimation () {
        superclass.apply(this, arguments);
    }

    if ( superclass ) BarChartAnimation.__proto__ = superclass;
    BarChartAnimation.prototype = Object.create( superclass && superclass.prototype );
    BarChartAnimation.prototype.constructor = BarChartAnimation;

    BarChartAnimation.prototype.setup = function setup () {
        var ref = this;
        var element = ref.element;
        var options = ref.options;
        var bbox = element.bbox();

        if (bbox) {
            this.origin = options.origin;
            var axis = options.vertical ? Y : X;

            var fromScale = this.fromScale = new geom.Point(1, 1);
            fromScale[axis] = START_SCALE;

            element.transform(geom.transform()
                .scale(fromScale.x, fromScale.y)
            );
        } else {
            this.abort();
        }
    };

    BarChartAnimation.prototype.step = function step (pos) {
        var scaleX = interpolateValue(this.fromScale.x, 1, pos);
        var scaleY = interpolateValue(this.fromScale.y, 1, pos);

        this.element.transform(geom.transform()
            .scale(scaleX, scaleY, this.origin)
        );
    };

    BarChartAnimation.prototype.abort = function abort () {
        superclass.prototype.abort.call(this);
        this.element.transform(null);
    };

    return BarChartAnimation;
}(draw.Animation));

setDefaultOptions(BarChartAnimation, {
    duration: INITIAL_ANIMATION_DURATION
});

draw.AnimationFactory.current.register(BAR, BarChartAnimation);

export default BarChartAnimation;