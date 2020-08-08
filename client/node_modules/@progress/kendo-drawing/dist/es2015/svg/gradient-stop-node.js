import Node from './node';
import renderAttr from './utils/render-attribute';

class GradientStopNode extends Node {
    template() {
        return `<stop ${this.renderOffset()} ${this.renderStyle()} />`;
    }

    renderOffset() {
        return renderAttr("offset", this.srcElement.offset());
    }

    mapStyle() {
        const srcElement = this.srcElement;
        return [
            [ "stop-color", srcElement.color() ],
            [ "stop-opacity", srcElement.opacity() ]
        ];
    }

    optionsChange(e) {
        if (e.field === "offset") {
            this.attr(e.field, e.value);
        } else if (e.field === "color" || e.field === "opacity") {
            this.css("stop-" + e.field, e.value);
        }
    }
}

export default GradientStopNode;