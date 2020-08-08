import QuadRoot from './quad-root';
import QuadNode from './quad-node';
import { Rect } from '../geometry';
import { Class } from '../common';
import { append } from '../util';

const ROOT_SIZE = 3000;
const LEVEL_STEP = 10000;
const MAX_LEVEL = 75;

class ShapesQuadTree extends Class {

    constructor() {
        super();

        this.initRoots();
    }

    initRoots() {
        this.rootMap = {};
        this.root = new QuadRoot();
        this.rootElements = [];
    }

    clear() {
        const rootElements = this.rootElements;
        for (let idx = 0; idx < rootElements.length; idx++) {
            this.remove(rootElements[idx]);
        }
        this.initRoots();
    }

    pointShape(point) {
        const sectorRoot = ( this.rootMap[ Math.floor( point.x / ROOT_SIZE ) ] || {} )[ Math.floor( point.y / ROOT_SIZE ) ];
        let result = this.root.pointShapes(point);

        if (sectorRoot) {
            result = result.concat(sectorRoot.pointShapes(point));
        }

        this.assignZindex(result);

        result.sort(zIndexComparer);
        for (let idx = 0; idx < result.length; idx++) {
            if (result[idx].containsPoint(point)) {
                return result[idx];
            }
        }
    }

    assignZindex(elements) {
        for (let idx = 0; idx < elements.length; idx++) {
            let element = elements[idx];
            let zIndex = 0;
            let levelWeight = Math.pow(LEVEL_STEP, MAX_LEVEL);
            let parents = [];

            while (element) {
                parents.push(element);
                element = element.parent;
            }

            while (parents.length) {
                element = parents.pop();
                zIndex += ((element.parent ? element.parent.children : this.rootElements).indexOf(element) + 1) * levelWeight;
                levelWeight /= LEVEL_STEP;
            }

            elements[idx]._zIndex = zIndex;
        }
    }

    optionsChange(e) {
        if (e.field === "transform" || e.field === "stroke.width") {
            this.bboxChange(e.element);
        }
    }

    geometryChange(e) {
        this.bboxChange(e.element);
    }

    bboxChange(element) {
        if (element.nodeType === "Group") {
            for (let idx = 0; idx < element.children.length; idx++) {
                this.bboxChange(element.children[idx]);
            }
        } else {
            if (element._quadNode) {
                element._quadNode.remove(element);
            }
            this._insertShape(element);
        }
    }

    add(elements) {
        const elementsArray = Array.isArray(elements) ? elements.slice(0) : [ elements ];

        append(this.rootElements, elementsArray);
        this._insert(elementsArray);
    }

    childrenChange(e) {
        if (e.action === "remove") {
            for (let idx = 0; idx < e.items.length; idx++) {
                this.remove(e.items[idx]);
            }
        } else {
            this._insert(Array.prototype.slice.call(e.items, 0));
        }
    }

    _insert(elements) {
        let element;

        while (elements.length > 0) {
            element = elements.pop();
            element.addObserver(this);
            if (element.nodeType === "Group") {
                append(elements, element.children);
            } else {
                this._insertShape(element);
            }
        }
    }

    _insertShape(shape) {
        const bbox = shape.bbox();
        if (bbox) {
            const sectors = this.getSectors(bbox);
            const x = sectors[0][0];
            const y = sectors[1][0];

            if (this.inRoot(sectors)) {
                this.root.insert(shape, bbox);
            } else {
                const rootMap = this.rootMap;
                if (!rootMap[x]) {
                    rootMap[x] = {};
                }

                if (!rootMap[x][y]) {
                    rootMap[x][y] = new QuadNode(
                        new Rect([ x * ROOT_SIZE, y * ROOT_SIZE ], [ ROOT_SIZE, ROOT_SIZE ])
                    );
                }

                rootMap[x][y].insert(shape, bbox);
            }
        }
    }

    remove(element) {
        element.removeObserver(this);

        if (element.nodeType === "Group") {
            const children = element.children;
            for (let idx = 0; idx < children.length; idx++) {
                this.remove(children[idx]);
            }
        } else if (element._quadNode) {
            element._quadNode.remove(element);
            delete element._quadNode;
        }
    }

    inRoot(sectors) {
        return sectors[0].length > 1 || sectors[1].length > 1;
    }

    getSectors(rect) {
        const bottomRight = rect.bottomRight();
        const bottomX = Math.floor(bottomRight.x / ROOT_SIZE);
        const bottomY = Math.floor(bottomRight.y / ROOT_SIZE);
        const sectors = [ [], [] ];
        for (let x = Math.floor(rect.origin.x / ROOT_SIZE); x <= bottomX; x++) {
            sectors[0].push(x);
        }
        for (let y = Math.floor(rect.origin.y / ROOT_SIZE); y <= bottomY; y++) {
            sectors[1].push(y);
        }
        return sectors;
    }
}

function zIndexComparer(x1, x2) {
    if (x1._zIndex < x2._zIndex) {
        return 1;
    }
    if (x1._zIndex > x2._zIndex) {
        return -1;
    }

    return 0;
}

export default ShapesQuadTree;