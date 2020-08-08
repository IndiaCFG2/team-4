import CandlestickChart from '../candlestick-chart/candlestick-chart';
import OHLCPoint from './ohlc-point';

class OHLCChart extends CandlestickChart {
    pointType() {
        return OHLCPoint;
    }
}

export default OHLCChart;