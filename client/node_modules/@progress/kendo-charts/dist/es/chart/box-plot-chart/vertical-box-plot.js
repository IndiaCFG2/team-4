import BoxPlot from './box-plot';

var VerticalBoxPlot = (function (BoxPlot) {
    function VerticalBoxPlot () {
        BoxPlot.apply(this, arguments);
    }

    if ( BoxPlot ) VerticalBoxPlot.__proto__ = BoxPlot;
    VerticalBoxPlot.prototype = Object.create( BoxPlot && BoxPlot.prototype );
    VerticalBoxPlot.prototype.constructor = VerticalBoxPlot;

    VerticalBoxPlot.prototype.reflowBoxSlot = function reflowBoxSlot (box) {
        this.boxSlot.y1 = box.y1;
        this.boxSlot.y2 = box.y2;
    };

    VerticalBoxPlot.prototype.reflowWhiskerSlot = function reflowWhiskerSlot (box) {
        this.whiskerSlot.y1 = box.y1;
        this.whiskerSlot.y2 = box.y2;
    };

    VerticalBoxPlot.prototype.calcMeanPoints = function calcMeanPoints (box, meanSlot) {
        return [
            [ [ meanSlot.x1, box.y1 ], [ meanSlot.x1, box.y2 ] ]
        ];
    };

    VerticalBoxPlot.prototype.calcWhiskerPoints = function calcWhiskerPoints (boxSlot, whiskerSlot) {
        var mid = whiskerSlot.center().y;
        return [ [
            [ whiskerSlot.x1, mid - 5 ], [ whiskerSlot.x1, mid + 5 ],
            [ whiskerSlot.x1, mid ], [ boxSlot.x1, mid ]
        ], [
            [ whiskerSlot.x2, mid - 5 ], [ whiskerSlot.x2, mid + 5 ],
            [ whiskerSlot.x2, mid ], [ boxSlot.x2, mid ]
        ] ];
    };

    VerticalBoxPlot.prototype.calcMedianPoints = function calcMedianPoints (box, medianSlot) {
        return [
            [ [ medianSlot.x1, box.y1 ], [ medianSlot.x1, box.y2 ] ]
        ];
    };

    return VerticalBoxPlot;
}(BoxPlot));

export default VerticalBoxPlot;