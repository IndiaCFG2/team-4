import Node from './node';
import NODE_MAP from './node-map';

class GroupNode extends Node {
    template() {
        return `<g${ this.renderId() + this.renderTransform() + this.renderStyle() + this.renderOpacity() + this.renderDefinitions() }>${ this.renderChildren() }</g>`;
    }

    optionsChange(e) {
        if (e.field === "transform") {
            this.transformChange(e.value);
        }

        super.optionsChange(e);
    }
}

NODE_MAP.Group = GroupNode;

export default GroupNode;