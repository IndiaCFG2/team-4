import LinearGradient from '../gradients/linear-gradient';
import RadialGradient from '../gradients/radial-gradient';
import LinearGradientNode from './linear-gradient-node';
import RadialGradientNode from './radial-gradient-node';
import Node from './node';
import ClipNode from './clip-node';

class DefinitionNode extends Node {
    constructor() {
        super();
        this.definitionMap = {};
    }

    attachTo(domElement) {
        this.element = domElement;
    }

    template() {
        return `<defs>${ this.renderChildren() }</defs>`;
    }

    definitionChange(e) {
        const { definitions, action } = e;

        if (action === "add") {
            this.addDefinitions(definitions);
        } else if (action === "remove") {
            this.removeDefinitions(definitions);
        }
    }

    createDefinition(type, item) {
        let nodeType;
        if (type === "clip") {
            nodeType = ClipNode;
        } else if (type === "fill") {
            if (item instanceof LinearGradient) {
                nodeType = LinearGradientNode;
            } else if (item instanceof RadialGradient) {
                nodeType = RadialGradientNode;
            }
        }
        return new nodeType(item);
    }

    addDefinitions(definitions) {
        for (let field in definitions) {
            this.addDefinition(field, definitions[field]);
        }
    }

    addDefinition(type, srcElement) {
        const { element, definitionMap } = this;
        const id = srcElement.id;
        const mapItem = definitionMap[id];
        if (!mapItem) {
            const node = this.createDefinition(type, srcElement);
            definitionMap[id] = {
                element: node,
                count: 1
            };
            this.append(node);
            if (element) {
                node.attachTo(this.element);
            }
        } else {
            mapItem.count++;
        }
    }

    removeDefinitions(definitions) {
        for (let field in definitions) {
            this.removeDefinition(definitions[field]);
        }
    }

    removeDefinition(srcElement) {
        const definitionMap = this.definitionMap;
        const id = srcElement.id;
        const mapItem = definitionMap[id];

        if (mapItem) {
            mapItem.count--;
            if (mapItem.count === 0) {
                this.remove(this.childNodes.indexOf(mapItem.element), 1);
                delete definitionMap[id];
            }
        }
    }
}

export default DefinitionNode;