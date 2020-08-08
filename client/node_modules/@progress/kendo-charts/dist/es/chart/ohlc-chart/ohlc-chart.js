import CandlestickChart from '../candlestick-chart/candlestick-chart';
import OHLCPoint from './ohlc-point';

var OHLCChart = (function (CandlestickChart) {
    function OHLCChart () {
        CandlestickChart.apply(this, arguments);
    }

    if ( CandlestickChart ) OHLCChart.__proto__ = CandlestickChart;
    OHLCChart.prototype = Object.create( CandlestickChart && CandlestickChart.prototype );
    OHLCChart.prototype.constructor = OHLCChart;

    OHLCChart.prototype.pointType = function pointType () {
        return OHLCPoint;
    };

    return OHLCChart;
}(CandlestickChart));

export default OHLCChart;