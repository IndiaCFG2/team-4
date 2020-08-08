import GradientStopNode from './gradient-stop-node';
import BaseNode from '../core/base-node';
import Node from './node';
import renderAllAttr from './utils/render-all-attributes';

class GradientNode extends Node {
    constructor(srcElement) {
        super(srcElement);

        this.id = srcElement.id;

        this.loadStops();
    }

    loadStops() {
        const stops = this.srcElement.stops;
        const element = this.element;

        for (let idx = 0; idx < stops.length; idx++) {
            let stopNode = new GradientStopNode(stops[idx]);
            this.append(stopNode);
            if (element) {
                stopNode.attachTo(element);
            }
        }
    }

    optionsChange(e) {
        if (e.field === "gradient.stops") {
            BaseNode.prototype.clear.call(this);
            this.loadStops();
        } else if (e.field === "gradient") {
            this.allAttr(this.mapCoordinates());
        }
    }

    renderCoordinates() {
        return renderAllAttr(this.mapCoordinates());
    }

    mapSpace() {
        return [ "gradientUnits", this.srcElement.userSpace() ? "userSpaceOnUse" : "objectBoundingBox" ];
    }
}

export default GradientNode;