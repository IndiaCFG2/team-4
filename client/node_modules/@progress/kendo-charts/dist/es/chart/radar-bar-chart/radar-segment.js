import DonutSegment from '../donut-chart/donut-segment';

import { setDefaultOptions } from '../../common';

var RadarSegment = (function (DonutSegment) {
    function RadarSegment(value, options) {
        DonutSegment.call(this, value, null, options);
    }

    if ( DonutSegment ) RadarSegment.__proto__ = DonutSegment;
    RadarSegment.prototype = Object.create( DonutSegment && DonutSegment.prototype );
    RadarSegment.prototype.constructor = RadarSegment;

    return RadarSegment;
}(DonutSegment));

setDefaultOptions(RadarSegment, {
    overlay: {
        gradient: "none"
    },
    labels: {
        distance: 10
    }
});

export default RadarSegment;