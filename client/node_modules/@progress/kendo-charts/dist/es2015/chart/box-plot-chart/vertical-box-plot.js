import BoxPlot from './box-plot';

class VerticalBoxPlot extends BoxPlot {
    reflowBoxSlot(box) {
        this.boxSlot.y1 = box.y1;
        this.boxSlot.y2 = box.y2;
    }

    reflowWhiskerSlot(box) {
        this.whiskerSlot.y1 = box.y1;
        this.whiskerSlot.y2 = box.y2;
    }

    calcMeanPoints(box, meanSlot) {
        return [
            [ [ meanSlot.x1, box.y1 ], [ meanSlot.x1, box.y2 ] ]
        ];
    }

    calcWhiskerPoints(boxSlot, whiskerSlot) {
        const mid = whiskerSlot.center().y;
        return [ [
            [ whiskerSlot.x1, mid - 5 ], [ whiskerSlot.x1, mid + 5 ],
            [ whiskerSlot.x1, mid ], [ boxSlot.x1, mid ]
        ], [
            [ whiskerSlot.x2, mid - 5 ], [ whiskerSlot.x2, mid + 5 ],
            [ whiskerSlot.x2, mid ], [ boxSlot.x2, mid ]
        ] ];
    }

    calcMedianPoints(box, medianSlot) {
        return [
            [ [ medianSlot.x1, box.y1 ], [ medianSlot.x1, box.y2 ] ]
        ];
    }
}

export default VerticalBoxPlot;