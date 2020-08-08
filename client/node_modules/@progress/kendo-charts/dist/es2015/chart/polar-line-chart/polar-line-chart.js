import ScatterLineChart from '../scatter-charts/scatter-line-chart';
import PolarScatterChart from '../polar-scatter-chart/polar-scatter-chart';

import { setDefaultOptions } from '../../common';

class PolarLineChart extends ScatterLineChart {
}

PolarLineChart.prototype.pointSlot = PolarScatterChart.prototype.pointSlot;

setDefaultOptions(PolarLineChart, {
    clip: false
});

export default PolarLineChart;