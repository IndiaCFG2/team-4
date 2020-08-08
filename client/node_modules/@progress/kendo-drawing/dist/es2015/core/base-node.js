import { Class } from '../common';

class BaseNode extends Class {
    constructor(srcElement) {
        super();

        this.childNodes = [];
        this.parent = null;

        if (srcElement) {
            this.srcElement = srcElement;
            this.observe();
        }
    }

    destroy() {
        if (this.srcElement) {
            this.srcElement.removeObserver(this);
        }

        const children = this.childNodes;
        for (let i = 0; i < children.length; i++) {
            this.childNodes[i].destroy();
        }

        this.parent = null;
    }

    load() {}

    observe() {
        if (this.srcElement) {
            this.srcElement.addObserver(this);
        }
    }

    append(node) {
        this.childNodes.push(node);
        node.parent = this;
    }

    insertAt(node, pos) {
        this.childNodes.splice(pos, 0, node);
        node.parent = this;
    }

    remove(index, count) {
        const end = index + count;
        for (let i = index; i < end; i++) {
            this.childNodes[i].removeSelf();
        }
        this.childNodes.splice(index, count);
    }

    removeSelf() {
        this.clear();
        this.destroy();
    }

    clear() {
        this.remove(0, this.childNodes.length);
    }

    invalidate() {
        if (this.parent) {
            this.parent.invalidate();
        }
    }

    geometryChange() {
        this.invalidate();
    }

    optionsChange() {
        this.invalidate();
    }

    childrenChange(e) {
        if (e.action === "add") {
            this.load(e.items, e.index);
        } else if (e.action === "remove") {
            this.remove(e.index, e.items.length);
        }

        this.invalidate();
    }
}

export default BaseNode;