import RadialScale from '../radial/radial-scale';
import { setDefaultOptions } from '../../common';

var ArcScale = (function (RadialScale) {
    function ArcScale () {
        RadialScale.apply(this, arguments);
    }

    if ( RadialScale ) ArcScale.__proto__ = RadialScale;
    ArcScale.prototype = Object.create( RadialScale && RadialScale.prototype );
    ArcScale.prototype.constructor = ArcScale;

    ArcScale.prototype.rangeSegments = function rangeSegments () {
        var ref = this.options;
        var min = ref.min;
        var max = ref.max;
        var rangePlaceholderColor = ref.rangePlaceholderColor;
        var rangeLineCap = ref.rangeLineCap;

        return [ { from: min, to: max, color: rangePlaceholderColor, lineCap: rangeLineCap } ];
    };

    ArcScale.prototype.hasRanges = function hasRanges () {
        return true;
    };

    ArcScale.prototype.placeholderRangeAngle = function placeholderRangeAngle (angle) {
        var geometry = this.ranges.children[0].geometry();

        if (this.options.reverse) {
            geometry.setEndAngle(angle);
        } else {
            geometry.setStartAngle(angle);
        }
    };

    ArcScale.prototype.addRange = function addRange (from, to, options) {
        var reverse = this.options.reverse;

        var startAngle = this.slotAngle(reverse ? to : from);
        var endAngle = this.slotAngle(reverse ? from : to);

        var range = this.createRange(startAngle, endAngle, this.getRangeRadius(), options);

        this.ranges.append(range);

        return range;
    };

    return ArcScale;
}(RadialScale));

setDefaultOptions(ArcScale, {
    min: 0,
    max: 100,

    majorTicks: {
        visible: false
    },

    minorTicks: {
        visible: false
    },

    labels: {
        visible: false
    },

    startAngle: 0,
    endAngle: 180,
    rangeLineCap: 'round'
});

export default ArcScale;