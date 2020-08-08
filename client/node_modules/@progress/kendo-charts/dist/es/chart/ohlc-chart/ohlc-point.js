import Candlestick from '../candlestick-chart/candlestick';

var OHLCPoint = (function (Candlestick) {
    function OHLCPoint () {
        Candlestick.apply(this, arguments);
    }

    if ( Candlestick ) OHLCPoint.__proto__ = Candlestick;
    OHLCPoint.prototype = Object.create( Candlestick && Candlestick.prototype );
    OHLCPoint.prototype.constructor = OHLCPoint;

    OHLCPoint.prototype.reflow = function reflow (box) {
        var ref = this;
        var options = ref.options;
        var value = ref.value;
        var chart = ref.owner;
        var valueAxis = chart.seriesValueAxis(options);
        var oPoints = [];
        var cPoints = [];
        var lhPoints = [];

        var lhSlot = valueAxis.getSlot(value.low, value.high);
        var oSlot = valueAxis.getSlot(value.open, value.open);
        var cSlot = valueAxis.getSlot(value.close, value.close);

        oSlot.x1 = cSlot.x1 = lhSlot.x1 = box.x1;
        oSlot.x2 = cSlot.x2 = lhSlot.x2 = box.x2;

        var mid = lhSlot.center().x;

        oPoints.push([ oSlot.x1, oSlot.y1 ]);
        oPoints.push([ mid, oSlot.y1 ]);
        cPoints.push([ mid, cSlot.y1 ]);
        cPoints.push([ cSlot.x2, cSlot.y1 ]);
        lhPoints.push([ mid, lhSlot.y1 ]);
        lhPoints.push([ mid, lhSlot.y2 ]);

        this.lines = [
            oPoints, cPoints, lhPoints
        ];

        this.box = lhSlot.clone().wrap(oSlot.clone().wrap(cSlot));

        this.reflowNote();
    };

    OHLCPoint.prototype.createBody = function createBody () {};

    return OHLCPoint;
}(Candlestick));

export default OHLCPoint;