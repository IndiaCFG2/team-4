import Group from '../shapes/group';
import Point from '../geometry/point';
import SurfaceFactory from './surface-factory';
import { Observable } from '../common';
import { eventElement, eventCoordinates, elementStyles, elementSize, elementOffset } from '../util';

const events = [
    "click",
    "mouseenter",
    "mouseleave",
    "mousemove",
    "resize"
];

class Surface extends Observable {

    constructor(element, options) {
        super();

        this.options = Object.assign({}, options);
        this.element = element;
        this.element._kendoExportVisual = this.exportVisual.bind(this);

        this._click = this._handler("click");
        this._mouseenter = this._handler("mouseenter");
        this._mouseleave = this._handler("mouseleave");
        this._mousemove = this._handler("mousemove");

        this._visual = new Group();

        elementSize(element, this.options);

        this.bind(events, this.options);

        this._enableTracking();
    }

    draw(element) {
        this._visual.children.push(element);
    }

    clear() {
        this._visual.children = [];
    }

    destroy() {
        this._visual = null;
        this.element._kendoExportVisual = null;
        this.unbind();
    }

    eventTarget(e) {
        let domNode = eventElement(e);
        let node;

        while (!node && domNode) {
            node = domNode._kendoNode;
            if (domNode === this.element) {
                break;
            }

            domNode = domNode.parentElement;
        }

        if (node) {
            return node.srcElement;
        }
    }

    exportVisual() {
        return this._visual;
    }

    getSize() {
        return elementSize(this.element);
    }

    currentSize(size) {
        if (size) {
            this._size = size;
        } else {
            return this._size;
        }
    }

    setSize(size) {
        elementSize(this.element, size);

        this.currentSize(size);
        this._resize();
    }

    resize(force) {
        const size = this.getSize();
        const currentSize = this.currentSize();

        if (force || (size.width > 0 || size.height > 0) && (!currentSize || size.width !== currentSize.width || size.height !== currentSize.height)) {
            this.currentSize(size);
            this._resize(size, force);
            this.trigger("resize", size);
        }
    }

    size(value) {
        if (!value) {
            return this.getSize();
        }

        this.setSize(value);
    }

    suspendTracking() {
        this._suspendedTracking = true;
    }

    resumeTracking() {
        this._suspendedTracking = false;
    }

    _enableTracking() {}

    _resize() {}

    _handler(eventName) {
        return (e) => {
            const node = this.eventTarget(e);
            if (node && !this._suspendedTracking) {
                this.trigger(eventName, {
                    element: node,
                    originalEvent: e,
                    type: eventName
                });
            }
        };
    }

    _elementOffset() {
        const element = this.element;
        const { paddingLeft, paddingTop } = elementStyles(element, [ "paddingLeft", "paddingTop" ]);
        const { left, top } = elementOffset(element);

        return {
            left: left + parseInt(paddingLeft, 10),
            top: top + parseInt(paddingTop, 10)
        };
    }

    _surfacePoint(e) {
        const offset = this._elementOffset();
        const coord = eventCoordinates(e);
        const x = coord.x - offset.left;
        const y = coord.y - offset.top;

        return new Point(x, y);
    }
}

Surface.create = function(element, options) {
    return SurfaceFactory.current.create(element, options);
};

Surface.support = {};

export default Surface;
