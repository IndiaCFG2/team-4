import { Class } from '../common';

var Highlight = (function (Class) {
    function Highlight() {
        Class.call(this);

        this._points = [];
    }

    if ( Class ) Highlight.__proto__ = Class;
    Highlight.prototype = Object.create( Class && Class.prototype );
    Highlight.prototype.constructor = Highlight;

    Highlight.prototype.destroy = function destroy () {
        this._points = [];
    };

    Highlight.prototype.show = function show (points) {
        var this$1 = this;

        var arrayPoints = [].concat(points);
        this.hide();

        for (var i = 0; i < arrayPoints.length; i++) {
            var point = arrayPoints[i];
            if (point && point.toggleHighlight && point.hasHighlight()) {
                this$1.togglePointHighlight(point, true);
                this$1._points.push(point);
            }
        }
    };

    Highlight.prototype.togglePointHighlight = function togglePointHighlight (point, show) {
        var toggleHandler = (point.options.highlight || {}).toggle;
        if (toggleHandler) {
            var eventArgs = {
                category: point.category,
                series: point.series,
                dataItem: point.dataItem,
                value: point.value,
                stackValue: point.stackValue,
                preventDefault: preventDefault,
                visual: point.highlightVisual(),
                show: show
            };
            toggleHandler(eventArgs);
            if (!eventArgs._defaultPrevented) {
                point.toggleHighlight(show);
            }
        } else {
            point.toggleHighlight(show);
        }
    };

    Highlight.prototype.hide = function hide () {
        var this$1 = this;

        var points = this._points;
        while (points.length) {
            this$1.togglePointHighlight(points.pop(), false);
        }
    };

    Highlight.prototype.isHighlighted = function isHighlighted (element) {
        var points = this._points;

        for (var i = 0; i < points.length; i++) {
            var point = points[i];
            if (element === point) {
                return true;
            }
        }

        return false;
    };

    return Highlight;
}(Class));

function preventDefault() {
    this._defaultPrevented = true;
}

export default Highlight;