import DonutSegment from '../donut-chart/donut-segment';

import { setDefaultOptions } from '../../common';

class RadarSegment extends DonutSegment {
    constructor(value, options) {
        super(value, null, options);
    }
}

setDefaultOptions(RadarSegment, {
    overlay: {
        gradient: "none"
    },
    labels: {
        distance: 10
    }
});

export default RadarSegment;