import BaseNode from '../core/base-node';
import Node from './node';
import DefinitionNode from './definition-node';

class RootNode extends Node {
    constructor(options) {
        super();
        this.options = options;
        this.defs = new DefinitionNode();
    }

    attachTo(domElement) {
        this.element = domElement;
        this.defs.attachTo(domElement.firstElementChild);
    }

    clear() {
        BaseNode.prototype.clear.call(this);
    }

    template() {
        return this.defs.render() + this.renderChildren();
    }

    definitionChange(e) {
        this.defs.definitionChange(e);
    }
}

export default RootNode;