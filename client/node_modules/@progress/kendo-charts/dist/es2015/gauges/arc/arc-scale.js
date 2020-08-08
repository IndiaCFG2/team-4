import RadialScale from '../radial/radial-scale';
import { setDefaultOptions } from '../../common';

class ArcScale extends RadialScale {

    rangeSegments() {
        const { min, max, rangePlaceholderColor, rangeLineCap } = this.options;

        return [ { from: min, to: max, color: rangePlaceholderColor, lineCap: rangeLineCap } ];
    }

    hasRanges() {
        return true;
    }

    placeholderRangeAngle(angle) {
        const geometry = this.ranges.children[0].geometry();

        if (this.options.reverse) {
            geometry.setEndAngle(angle);
        } else {
            geometry.setStartAngle(angle);
        }
    }

    addRange(from, to, options) {
        const reverse = this.options.reverse;

        const startAngle = this.slotAngle(reverse ? to : from);
        const endAngle = this.slotAngle(reverse ? from : to);

        const range = this.createRange(startAngle, endAngle, this.getRangeRadius(), options);

        this.ranges.append(range);

        return range;
    }
}

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