import BaseNode from '../core/base-node';
import renderAllAttr from './utils/render-all-attributes';
import renderAttr from './utils/render-attribute';
import renderStyle from './utils/render-style';
import NODE_MAP from './node-map';
import renderSVG from './utils/render-svg';
import { SVG_NS, NONE } from './constants';
import { support } from '../common';
import { defined } from '../util';

const TRANSFORM = "transform";
const DefinitionMap = {
    clip: "clip-path",
    fill: "fill"
};

function isDefinition(type, value) {
    return type === "clip" || (type === "fill" && (!value || value.nodeType === "Gradient"));
}

function baseUrl() {
    const base = document.getElementsByTagName("base")[0];
    let href = document.location.href;
    let url = "";

    if (base && !(support.browser || {}).msie) {
        const hashIndex = href.indexOf("#");
        if (hashIndex !== -1) {
            href = href.substring(0, hashIndex);
        }

        url = href;
    }

    return url;
}

class Node extends BaseNode {

    constructor(srcElement, options) {
        super(srcElement);
        this.definitions = {};

        this.options = options;
    }

    destroy() {
        if (this.element) {
            this.element._kendoNode = null;
            this.element = null;
        }

        this.clearDefinitions();
        super.destroy();
    }

    load(elements, pos) {
        for (let i = 0; i < elements.length; i++) {
            const srcElement = elements[i];
            const children = srcElement.children;

            const childNode = new NODE_MAP[srcElement.nodeType](srcElement, this.options);

            if (defined(pos)) {
                this.insertAt(childNode, pos);
            } else {
                this.append(childNode);
            }

            childNode.createDefinitions();

            if (children && children.length > 0) {
                childNode.load(children);
            }

            const element = this.element;
            if (element) {
                childNode.attachTo(element, pos);
            }
        }
    }

    root() {
        let root = this;

        while (root.parent) {
            root = root.parent;
        }

        return root;
    }

    attachTo(domElement, pos) {
        const container = document.createElement("div");
        renderSVG(container,
            "<svg xmlns='" + SVG_NS + "' version='1.1'>" +
                this.render() +
            "</svg>"
        );

        const element = container.firstChild.firstChild;
        if (element) {
            if (defined(pos)) {
                domElement.insertBefore(element, domElement.childNodes[pos] || null);
            } else {
                domElement.appendChild(element);
            }
            this.setElement(element);
        }
    }

    setElement(element) {
        if (this.element) {
            this.element._kendoNode = null;
        }

        this.element = element;
        this.element._kendoNode = this;

        const nodes = this.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            let childElement = element.childNodes[i];
            nodes[i].setElement(childElement);
        }
    }

    clear() {
        this.clearDefinitions();

        if (this.element) {
            this.element.innerHTML = "";
        }

        const children = this.childNodes;
        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }

        this.childNodes = [];
    }

    removeSelf() {
        if (this.element) {
            const parentNode = this.element.parentNode;
            if (parentNode) {
                parentNode.removeChild(this.element);
            }
            this.element = null;
        }

        super.removeSelf();
    }

    template() {
        return this.renderChildren();
    }

    render() {
        return this.template();
    }

    renderChildren() {
        const nodes = this.childNodes;
        let output = "";

        for (let i = 0; i < nodes.length; i++) {
            output += nodes[i].render();
        }

        return output;
    }

    optionsChange(e) {
        const { field, value } = e;

        if (field === "visible") {
            this.css("display", value ? "" : NONE);
        } else if (DefinitionMap[field] && isDefinition(field, value)) {
            this.updateDefinition(field, value);
        } else if (field === "opacity") {
            this.attr("opacity", value);
        } else if (field === "cursor") {
            this.css("cursor", value);
        } else if (field === "id") {
            if (value) {
                this.attr("id", value);
            } else {
                this.removeAttr("id");
            }
        }

        super.optionsChange(e);
    }

    attr(name, value) {
        if (this.element) {
            this.element.setAttribute(name, value);
        }
    }

    allAttr(attrs) {
        for (let i = 0; i < attrs.length; i++) {
            this.attr(attrs[i][0], attrs[i][1]);
        }
    }

    css(name, value) {
        if (this.element) {
            this.element.style[name] = value;
        }
    }

    allCss(styles) {
        for (let i = 0; i < styles.length; i++) {
            this.css(styles[i][0], styles[i][1]);
        }
    }

    removeAttr(name) {
        if (this.element) {
            this.element.removeAttribute(name);
        }
    }

    mapTransform(transform) {
        const attrs = [];
        if (transform) {
            attrs.push([
                TRANSFORM,
                "matrix(" + transform.matrix().toString(6) + ")"
            ]);
        }

        return attrs;
    }

    renderTransform() {
        return renderAllAttr(
            this.mapTransform(this.srcElement.transform())
        );
    }

    transformChange(value) {
        if (value) {
            this.allAttr(this.mapTransform(value));
        } else {
            this.removeAttr(TRANSFORM);
        }
    }

    mapStyle() {
        const options = this.srcElement.options;
        const style = [ [ "cursor", options.cursor ] ];

        if (options.visible === false) {
            style.push([ "display", NONE ]);
        }

        return style;
    }

    renderStyle() {
        return renderAttr("style", renderStyle(this.mapStyle(true)));
    }

    renderOpacity() {
        return renderAttr("opacity", this.srcElement.options.opacity);
    }

    renderId() {
        return renderAttr("id", this.srcElement.options.id);
    }

    createDefinitions() {
        const srcElement = this.srcElement;
        const definitions = this.definitions;
        if (srcElement) {
            const options = srcElement.options;
            let hasDefinitions;

            for (let field in DefinitionMap) {
                let definition = options.get(field);
                if (definition && isDefinition(field, definition)) {
                    definitions[field] = definition;
                    hasDefinitions = true;
                }
            }
            if (hasDefinitions) {
                this.definitionChange({
                    action: "add",
                    definitions: definitions
                });
            }
        }
    }

    definitionChange(e) {
        if (this.parent) {
            this.parent.definitionChange(e);
        }
    }

    updateDefinition(type, value) {
        const definitions = this.definitions;
        const current = definitions[type];
        const attr = DefinitionMap[type];
        const definition = {};
        if (current) {
            definition[type] = current;
            this.definitionChange({
                action: "remove",
                definitions: definition
            });
            delete definitions[type];
        }

        if (!value) {
            if (current) {
                this.removeAttr(attr);
            }
        } else {
            definition[type] = value;
            this.definitionChange({
                action: "add",
                definitions: definition
            });
            definitions[type] = value;
            this.attr(attr, this.refUrl(value.id));
        }
    }

    clearDefinitions() {
        const definitions = this.definitions;

        this.definitionChange({
            action: "remove",
            definitions: definitions
        });
        this.definitions = {};
    }

    renderDefinitions() {
        return renderAllAttr(this.mapDefinitions());
    }

    mapDefinitions() {
        const definitions = this.definitions;
        const attrs = [];

        for (let field in definitions) {
            attrs.push([ DefinitionMap[field], this.refUrl(definitions[field].id) ]);
        }

        return attrs;
    }

    refUrl(id) {
        const skipBaseHref = (this.options || {}).skipBaseHref;
        const baseHref = this.baseUrl().replace(/'/g, "\\'");
        const base = skipBaseHref ? '' : baseHref;
        return `url(${ base }#${ id })`;
    }

    baseUrl() {
        return baseUrl();
    }
}

export default Node;
