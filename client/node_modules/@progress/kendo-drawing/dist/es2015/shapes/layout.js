import Group from './group';
import Size from '../geometry/size';
import Rect from '../geometry/rect';
import Point from '../geometry/point';
import createTransform from '../geometry/transform';
import translateToPoint from '../alignment/translate-to-point';
import alignStart from '../alignment/align-start';
import alignStartReverse from '../alignment/align-start-reverse';

const DEFAULT_OPTIONS = {
    alignContent: "start",
    justifyContent: "start",
    alignItems: "start",
    spacing: 0,
    orientation: "horizontal",
    lineSpacing: 0,
    wrap: true,
    revers: false
};

const forEach = (elements, callback) => {
    elements.forEach(callback);
};

const forEachReverse = (elements, callback) => {
    const length = elements.length;

    for (let idx = length - 1; idx >= 0; idx--) {
        callback(elements[idx], idx);
    }
};

class Layout extends Group {

    constructor(rect, options) {
        super(Object.assign({}, DEFAULT_OPTIONS, options));
        this._rect = rect;
        this._fieldMap = {};
    }

    rect(value) {
        if (value) {
            this._rect = value;
            return this;
        }

        return this._rect;
    }

    _initMap() {
        const options = this.options;
        const fieldMap = this._fieldMap;
        if (options.orientation === "horizontal") {
            fieldMap.sizeField = "width";
            fieldMap.groupsSizeField = "height";
            fieldMap.groupAxis = "x";
            fieldMap.groupsAxis = "y";
        } else {
            fieldMap.sizeField = "height";
            fieldMap.groupsSizeField = "width";
            fieldMap.groupAxis = "y";
            fieldMap.groupsAxis = "x";
        }

        if (options.reverse) {
            this.forEach = forEachReverse;
            this.justifyAlign = alignStartReverse;
        } else {
            this.forEach = forEach;
            this.justifyAlign = alignStart;
        }
    }

    reflow() {
        if (!this._rect || this.children.length === 0) {
            return;
        }
        this._initMap();

        if (this.options.transform) {
            this.transform(null);
        }

        const options = this.options;
        const rect = this._rect;
        const { groups, groupsSize } = this._initGroups();
        const { sizeField, groupsSizeField, groupAxis, groupsAxis } = this._fieldMap;
        const groupOrigin = new Point();
        const elementOrigin = new Point();
        const size = new Size();
        let groupStart = alignStart(groupsSize, rect, options.alignContent, groupsAxis, groupsSizeField);
        let elementStart, group, groupBox;

        const arrangeElements = (bbox, idx) => {
            const element = group.elements[idx];

            elementOrigin[groupAxis] = elementStart;
            elementOrigin[groupsAxis] = alignStart(bbox.size[groupsSizeField], groupBox, options.alignItems, groupsAxis, groupsSizeField);
            translateToPoint(elementOrigin, bbox, element);
            elementStart += bbox.size[sizeField] + options.spacing;
        };

        for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
            group = groups[groupIdx];
            groupOrigin[groupAxis] = elementStart = this.justifyAlign(group.size, rect, options.justifyContent, groupAxis, sizeField);
            groupOrigin[groupsAxis] = groupStart;
            size[sizeField] = group.size;
            size[groupsSizeField] = group.lineSize;
            groupBox = new Rect(groupOrigin, size);
            this.forEach(group.bboxes, arrangeElements);

            groupStart += group.lineSize + options.lineSpacing;
        }

        if (!options.wrap && group.size > rect.size[sizeField]) {
            const scale = rect.size[sizeField] / groupBox.size[sizeField];
            const scaledStart = groupBox.topLeft().scale(scale, scale);
            const scaledSize = groupBox.size[groupsSizeField] * scale;
            const newStart = alignStart(scaledSize, rect, options.alignContent, groupsAxis, groupsSizeField);
            const transform = createTransform();
            if (groupAxis === "x") {
                transform.translate(rect.origin.x - scaledStart.x, newStart - scaledStart.y);
            } else {
                transform.translate(newStart - scaledStart.x, rect.origin.y - scaledStart.y);
            }
            transform.scale(scale, scale);

            this.transform(transform);
        }
    }

    _initGroups() {
        const { options, children } = this;
        const { lineSpacing, wrap, spacing } = options;
        const sizeField = this._fieldMap.sizeField;
        let group = this._newGroup();
        const groups = [];
        const addGroup = function() {
            groups.push(group);
            groupsSize += group.lineSize + lineSpacing;
        };
        let groupsSize = -lineSpacing;

        for (let idx = 0; idx < children.length; idx++) {
            let element = children[idx];
            let bbox = children[idx].clippedBBox();
            if (element.visible() && bbox) {
                if (wrap && group.size + bbox.size[sizeField] + spacing > this._rect.size[sizeField]) {
                    if (group.bboxes.length === 0) {
                        this._addToGroup(group, bbox, element);
                        addGroup();
                        group = this._newGroup();
                    } else {
                        addGroup();
                        group = this._newGroup();
                        this._addToGroup(group, bbox, element);
                    }
                } else {
                    this._addToGroup(group, bbox, element);
                }
            }
        }

        if (group.bboxes.length) {
            addGroup();
        }

        return {
            groups: groups,
            groupsSize: groupsSize
        };
    }

    _addToGroup(group, bbox, element) {
        group.size += bbox.size[this._fieldMap.sizeField] + this.options.spacing;
        group.lineSize = Math.max(bbox.size[this._fieldMap.groupsSizeField], group.lineSize);
        group.bboxes.push(bbox);
        group.elements.push(element);
    }

    _newGroup() {
        return {
            lineSize: 0,
            size: -this.options.spacing,
            bboxes: [],
            elements: []
        };
    }
}

export default Layout;