import acceptKey from './accept-key';
import toChartAxisRanges from './to-chart-axis-ranges';

import { X, Y } from '../../common/constants';
import { Class, deepExtend, elementStyles, elementOffset, defined } from '../../common';

var ZoomSelection = (function (Class) {
    function ZoomSelection(chart, options) {
        Class.call(this);

        this.chart = chart;
        this.options = deepExtend({}, this.options, options);
        this.createElement();
    }

    if ( Class ) ZoomSelection.__proto__ = Class;
    ZoomSelection.prototype = Object.create( Class && Class.prototype );
    ZoomSelection.prototype.constructor = ZoomSelection;

    ZoomSelection.prototype.createElement = function createElement () {
        var marquee = this._marquee = document.createElement("div");
        marquee.className = "k-marquee";
        var marqueeColor = document.createElement("div");
        marqueeColor.className = "k-marquee-color";
        marquee.appendChild(marqueeColor);
    };

    ZoomSelection.prototype.removeElement = function removeElement () {
        if (this._marquee.parentNode) {
            this._marquee.parentNode.removeChild(this._marquee);
        }
    };

    ZoomSelection.prototype.setStyles = function setStyles (styles) {
        elementStyles(this._marquee, styles);
    };

    ZoomSelection.prototype.start = function start (e) {
        if (acceptKey(e, this.options.key)) {
            var chart = this.chart;
            var point = chart._eventCoordinates(e);
            var zoomPane = this._zoomPane = chart._plotArea.paneByPoint(point);
            var clipBox = zoomPane ? zoomPane.chartsBox().clone() : null;

            if (zoomPane && clipBox) {
                var offset = this._elementOffset();

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
    };

    ZoomSelection.prototype._elementOffset = function _elementOffset () {
        var chartElement = this.chart.element;
        var ref = elementStyles(chartElement, [ "paddingLeft", "paddingTop" ]);
        var paddingLeft = ref.paddingLeft;
        var paddingTop = ref.paddingTop;
        var offset = elementOffset(chartElement);

        return {
            left: paddingLeft + offset.left,
            top: paddingTop + offset.top
        };
    };

    ZoomSelection.prototype.move = function move (e) {
        var zoomPane = this._zoomPane;
        if (zoomPane) {
            this.setStyles(this._selectionPosition(e));
        }
    };

    ZoomSelection.prototype.end = function end (e) {
        var zoomPane = this._zoomPane;
        if (zoomPane) {
            var elementOffset = this._elementOffset();
            var selectionPosition = this._selectionPosition(e);
            selectionPosition.left -= elementOffset.left;
            selectionPosition.top -= elementOffset.top;

            var start = { x: selectionPosition.left, y: selectionPosition.top };
            var end = { x: selectionPosition.left + selectionPosition.width, y: selectionPosition.top + selectionPosition.height };
            this._updateAxisRanges(start, end);

            this.removeElement();
            delete this._zoomPane;

            return toChartAxisRanges(this.axisRanges);
        }
    };

    ZoomSelection.prototype.zoom = function zoom () {
        var axisRanges = this.axisRanges;
        if (axisRanges && axisRanges.length) {
            var plotArea = this.chart._plotArea;
            for (var idx = 0; idx < axisRanges.length; idx++) {
                var axisRange = axisRanges[idx];
                plotArea.updateAxisOptions(axisRange.axis, axisRange.range);
            }
            plotArea.redraw(plotArea.panes);
        }
    };

    ZoomSelection.prototype.destroy = function destroy () {
        this.removeElement();
        delete this._marquee;
        delete this.chart;
    };

    ZoomSelection.prototype._updateAxisRanges = function _updateAxisRanges (start, end) {
        var lock = (this.options.lock || "").toLowerCase();
        var axisRanges = [];

        var axes = this._zoomPane.axes;
        for (var idx = 0; idx < axes.length; idx++) {
            var axis = axes[idx];
            var vertical = axis.options.vertical;
            if (!(lock === X && !vertical) && !(lock === Y && vertical) && defined(axis.axisIndex)) {
                var range = axis.pointsRange(start, end);
                if (range) {
                    axisRanges.push({
                        axis: axis,
                        range: range
                    });
                }
            }
        }

        this.axisRanges = axisRanges;
    };

    ZoomSelection.prototype._selectionPosition = function _selectionPosition (e) {
        var clipBox = this._zoomPaneClipBox;
        var startLocation = {
            x: e.x.startLocation,
            y: e.y.startLocation
        };
        var pageX = e.x.location;
        var pageY = e.y.location;
        var lock = (this.options.lock || "").toLowerCase();
        var left = Math.min(startLocation.x, pageX);
        var top = Math.min(startLocation.y, pageY);
        var width = Math.abs(startLocation.x - pageX);
        var height = Math.abs(startLocation.y - pageY);

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
    };

    return ZoomSelection;
}(Class));

ZoomSelection.prototype.options = {
    key: "shift",
    lock: "none"
};

export default ZoomSelection;