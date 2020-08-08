import acceptKey from './accept-key';
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend, elementStyles, elementOffset, defined } from '../../common';

class ZoomSelection extends Class {
    constructor(chart, options) {
        super();

        this.chart = chart;
        this.options = deepExtend({}, this.options, options);
        this.createElement();
    }

    createElement() {
        const marquee = this._marquee = document.createElement("div");
        marquee.className = "k-marquee";
        const marqueeColor = document.createElement("div");
        marqueeColor.className = "k-marquee-color";
        marquee.appendChild(marqueeColor);
    }

    removeElement() {
        if (this._marquee.parentNode) {
            this._marquee.parentNode.removeChild(this._marquee);
        }
    }

    setStyles(styles) {
        elementStyles(this._marquee, styles);
    }

    start(e) {
        if (acceptKey(e, this.options.key)) {
            const chart = this.chart;
            const point = chart._eventCoordinates(e);
            const zoomPane = this._zoomPane = chart._plotArea.paneByPoint(point);
            const clipBox = zoomPane ? zoomPane.chartsBox().clone() : null;

            if (zoomPane && clipBox) {
                const offset = this._elementOffset();

                clipBox.translate(offset.left, offset.top);
                this._zoomPaneClipBox = clipBox;

                document.body.appendChild(this._marquee);
                this.setStyles({
                    left: e.pageX + 1,
                    top: e.pageY + 1,
                    width: 0,
                    height: 0
                });

                return true;
            }
        }
        return false;
    }

    _elementOffset() {
        const chartElement = this.chart.element;
        const { paddingLeft, paddingTop } = elementStyles(chartElement, [ "paddingLeft", "paddingTop" ]);
        const offset = elementOffset(chartElement);

        return {
            left: paddingLeft + offset.left,
            top: paddingTop + offset.top
        };
    }

    move(e) {
        const zoomPane = this._zoomPane;
        if (zoomPane) {
            this.setStyles(this._selectionPosition(e));
        }
    }

    end(e) {
        const zoomPane = this._zoomPane;
        if (zoomPane) {
            const elementOffset = this._elementOffset();
            const selectionPosition = this._selectionPosition(e);
            selectionPosition.left -= elementOffset.left;
            selectionPosition.top -= elementOffset.top;

            const start = { x: selectionPosition.left, y: selectionPosition.top };
            const end = { x: selectionPosition.left + selectionPosition.width, y: selectionPosition.top + selectionPosition.height };
            this._updateAxisRanges(start, end);

            this.removeElement();
            delete this._zoomPane;

            return toChartAxisRanges(this.axisRanges);
        }
    }

    zoom() {
        const axisRanges = this.axisRanges;
        if (axisRanges && axisRanges.length) {
            const plotArea = this.chart._plotArea;
            for (let idx = 0; idx < axisRanges.length; idx++) {
                const axisRange = axisRanges[idx];
                plotArea.updateAxisOptions(axisRange.axis, axisRange.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    }

    destroy() {
        this.removeElement();
        delete this._marquee;
        delete this.chart;
    }

    _updateAxisRanges(start, end) {
        const lock = (this.options.lock || "").toLowerCase();
        const axisRanges = [];

        const axes = this._zoomPane.axes;
        for (let idx = 0; idx < axes.length; idx++) {
            const axis = axes[idx];
            const vertical = axis.options.vertical;
            if (!(lock === X && !vertical) && !(lock === Y && vertical) && defined(axis.axisIndex)) {
                const range = axis.pointsRange(start, end);
                if (range) {
                    axisRanges.push({
                        axis: axis,
                        range: range
                    });
                }
            }
        }

        this.axisRanges = axisRanges;
    }

    _selectionPosition(e) {
        const clipBox = this._zoomPaneClipBox;
        const startLocation = {
            x: e.x.startLocation,
            y: e.y.startLocation
        };
        const { x: { location: pageX }, y: { location: pageY } } = e;
        const lock = (this.options.lock || "").toLowerCase();
        let left = Math.min(startLocation.x, pageX);
        let top = Math.min(startLocation.y, pageY);
        let width = Math.abs(startLocation.x - pageX);
        let height = Math.abs(startLocation.y - pageY);

        if (lock === X) {
            left = clipBox.x1;
            width = clipBox.width();
        }
        if (lock === Y) {
            top = clipBox.y1;
            height = clipBox.height();
        }

        if (pageX > clipBox.x2) {
            width = clipBox.x2 - startLocation.x;
        }

        if (pageX < clipBox.x1) {
            width = startLocation.x - clipBox.x1;
        }

        if (pageY > clipBox.y2) {
            height = clipBox.y2 - startLocation.y;
        }

        if (pageY < clipBox.y1) {
            height = startLocation.y - clipBox.y1;
        }

        return {
            left: Math.max(left, clipBox.x1),
            top: Math.max(top, clipBox.y1),
            width: width,
            height: height
        };
    }
}

ZoomSelection.prototype.options = {
    key: "shift",
    lock: "none"
};

export default ZoomSelection;