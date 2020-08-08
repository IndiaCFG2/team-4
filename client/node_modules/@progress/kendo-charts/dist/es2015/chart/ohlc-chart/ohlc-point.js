import Candlestick from '../candlestick-chart/candlestick';

class OHLCPoint extends Candlestick {
    reflow(box) {
        const { options, value, owner: chart } = this;
        const valueAxis = chart.seriesValueAxis(options);
        const oPoints = [];
        const cPoints = [];
        const lhPoints = [];

        const lhSlot = valueAxis.getSlot(value.low, value.high);
        const oSlot = valueAxis.getSlot(value.open, value.open);
        const cSlot = valueAxis.getSlot(value.close, value.close);

        oSlot.x1 = cSlot.x1 = lhSlot.x1 = box.x1;
        oSlot.x2 = cSlot.x2 = lhSlot.x2 = box.x2;

        const mid = lhSlot.center().x;

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
    }

    createBody() {}
}

export default OHLCPoint;