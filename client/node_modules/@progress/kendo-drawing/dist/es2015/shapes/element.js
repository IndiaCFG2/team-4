import OptionsStore from '../core/options-store';
import ObserversMixin from '../mixins/observers-mixin';
import Rect from '../geometry/rect';
import Matrix from '../geometry/matrix';
import createTransform from '../geometry/transform';
import toMatrix from '../geometry/to-matrix';
import { Class } from '../common';
import { defined, definitionId, isTransparent, valueOrDefault } from '../util';

class Element extends Class {

    constructor(options) {
        super();

        this._initOptions(options);
    }

    _initOptions(options = {}) {
        const { clip, transform } = options;

        if (transform) {
            options.transform = createTransform(transform);
        }

        if (clip && !clip.id) {
            clip.id = definitionId();
        }

        this.options = new OptionsStore(options);
        this.options.addObserver(this);
    }

    transform(value) {
        if (defined(value)) {
            this.options.set("transform", createTransform(value));
        } else {
            return this.options.get("transform");
        }
    }

    parentTransform() {
        let element = this;
        let parentMatrix;

        while (element.parent) {
            element = element.parent;
            let transformation = element.transform();
            if (transformation) {
                parentMatrix = transformation.matrix().multiplyCopy(parentMatrix || Matrix.unit());
            }
        }

        if (parentMatrix) {
            return createTransform(parentMatrix);
        }
    }

    currentTransform(parentTransform = this.parentTransform()) {
        const elementTransform = this.transform();
        const elementMatrix = toMatrix(elementTransform);

        let parentMatrix = toMatrix(parentTransform);
        let combinedMatrix;

        if (elementMatrix && parentMatrix) {
            combinedMatrix = parentMatrix.multiplyCopy(elementMatrix);
        } else {
            combinedMatrix = elementMatrix || parentMatrix;
        }

        if (combinedMatrix) {
            return createTransform(combinedMatrix);
        }
    }

    visible(value) {
        if (defined(value)) {
            this.options.set("visible", value);
            return this;
        }

        return this.options.get("visible") !== false;
    }

    clip(value) {
        const options = this.options;
        if (defined(value)) {
            if (value && !value.id) {
                value.id = definitionId();
            }
            options.set("clip", value);
            return this;
        }

        return options.get("clip");
    }

    opacity(value) {
        if (defined(value)) {
            this.options.set("opacity", value);
            return this;
        }

        return valueOrDefault(this.options.get("opacity"), 1);
    }

    clippedBBox(transformation) {
        const bbox = this._clippedBBox(transformation);
        if (bbox) {
            const clip = this.clip();
            return clip ? Rect.intersect(bbox, clip.bbox(transformation)) : bbox;
        }
    }

    containsPoint(point, parentTransform) {
        if (this.visible()) {
            const transform = this.currentTransform(parentTransform);
            let transformedPoint = point;
            if (transform) {
                transformedPoint = point.transformCopy(transform.matrix().invert());
            }
            return (this._hasFill() && this._containsPoint(transformedPoint)) || (this._isOnPath && this._hasStroke() && this._isOnPath(transformedPoint));
        }
        return false;
    }

    _hasFill() {
        const fill = this.options.fill;
        return fill && !isTransparent(fill.color);
    }

    _hasStroke() {
        const stroke = this.options.stroke;
        return stroke && stroke.width > 0 && !isTransparent(stroke.color);
    }

    _clippedBBox(transformation) {
        return this.bbox(transformation);
    }
}

Element.prototype.nodeType = "Element";

ObserversMixin.extend(Element.prototype);

export default Element;
