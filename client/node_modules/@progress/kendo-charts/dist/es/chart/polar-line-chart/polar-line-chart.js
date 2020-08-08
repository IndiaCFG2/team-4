import ScatterLineChart from '../scatter-charts/scatter-line-chart';
import PolarScatterChart from '../polar-scatter-chart/polar-scatter-chart';

import { setDefaultOptions } from '../../common';

var PolarLineChart = (function (ScatterLineChart) {
    function PolarLineChart () {
        ScatterLineChart.apply(this, arguments);
    }if ( ScatterLineChart ) PolarLineChart.__proto__ = ScatterLineChart;
    PolarLineChart.prototype = Object.create( ScatterLineChart && ScatterLineChart.prototype );
    PolarLineChart.prototype.constructor = PolarLineChart;

    

    return PolarLineChart;
}(ScatterLineChart));

PolarLineChart.prototype.pointSlot = PolarScatterChart.prototype.pointSlot;

setDefaultOptions(PolarLineChart, {
    clip: false
});

export default PolarLineChart;