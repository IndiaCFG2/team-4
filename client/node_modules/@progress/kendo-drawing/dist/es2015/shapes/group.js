import Element from './element';
import Traversable from '../mixins/traversable';
import { append } from '../util';
import elementsBoundingBox from './utils/elements-bounding-box';
import elementsClippedBoundingBox from './utils/elements-clippend-bounding-box';

class Group extends Element {

    constructor(options) {
        super(options);
        this.children = [];
    }

    childrenChange(action, items, index) {
        this.trigger("childrenChange",{
            action: action,
            items: items,
            index: index
        });
    }

    append() {
        append(this.children, arguments);
        this._reparent(arguments, this);

        this.childrenChange("add", arguments);

        return this;
    }

    insert(index, element) {
        this.children.splice(index, 0, element);
        element.parent = this;

        this.childrenChange("add", [ element ], index);

        return this;
    }

    insertAt(element, index) {
        return this.insert(index, element);
    }

    remove(element) {
        const index = this.children.indexOf(element);
        if (index >= 0) {
            this.children.splice(index, 1);
            element.parent = null;
            this.childrenChange("remove", [ element ], index);
        }

        return this;
    }

    removeAt(index) {
        if (0 <= index && index < this.children.length) {
            let element = this.children[index];
            this.children.splice(index, 1);
            element.parent = null;
            this.childrenChange("remove", [ element ], index);
        }

        return this;
    }

    clear() {
        const items = this.children;
        this.children = [];
        this._reparent(items, null);

        this.childrenChange("remove", items, 0);

        return this;
    }

    bbox(transformation) {
        return elementsBoundingBox(this.children, true, this.currentTransform(transformation));
    }

    rawBBox() {
        return elementsBoundingBox(this.children, false);
    }

    _clippedBBox(transformation) {
        return elementsClippedBoundingBox(this.children, this.currentTransform(transformation));
    }

    currentTransform(transformation) {
        return Element.prototype.currentTransform.call(this, transformation) || null;
    }

    containsPoint(point, parentTransform) {
        if (this.visible()) {
            const children = this.children;
            const transform = this.currentTransform(parentTransform);
            for (let idx = 0; idx < children.length; idx++) {
                if (children[idx].containsPoint(point, transform)) {
                    return true;
                }
            }
        }
        return false;
    }

    _reparent(elements, newParent) {
        for (let i = 0; i < elements.length; i++) {
            const child = elements[i];
            const parent = child.parent;
            if (parent && parent !== this && parent.remove) {
                parent.remove(child);
            }

            child.parent = newParent;
        }
    }
}

Group.prototype.nodeType = "Group";

Traversable.extend(Group.prototype, "children");

export default Group;