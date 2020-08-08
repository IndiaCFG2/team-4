import { Class } from '../common';

class Highlight extends Class {
    constructor() {
        super();

        this._points = [];
    }

    destroy() {
        this._points = [];
    }

    show(points) {
        const arrayPoints = [].concat(points);
        this.hide();

        for (let i = 0; i < arrayPoints.length; i++) {
            const point = arrayPoints[i];
            if (point && point.toggleHighlight && point.hasHighlight()) {
                this.togglePointHighlight(point, true);
                this._points.push(point);
            }
        }
    }

    togglePointHighlight(point, show) {
        const toggleHandler = (point.options.highlight || {}).toggle;
        if (toggleHandler) {
            const eventArgs = {
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
    }

    hide() {
        const points = this._points;
        while (points.length) {
            this.togglePointHighlight(points.pop(), false);
        }
    }

    isHighlighted(element) {
        const points = this._points;

        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            if (element === point) {
                return true;
            }
        }

        return false;
    }
}

function preventDefault() {
    this._defaultPrevented = true;
}

export default Highlight;