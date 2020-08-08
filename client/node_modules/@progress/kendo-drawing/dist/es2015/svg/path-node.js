import Node from './node';
import { defined, isTransparent } from '../util';
import { DASH_ARRAYS, SOLID, BUTT } from '../core/constants';
import { NONE } from './constants';
import renderAllAttr from './utils/render-all-attributes';
import renderAttr from './utils/render-attribute';
import NODE_MAP from './node-map';

const ATTRIBUTE_MAP = {
    "fill.opacity": "fill-opacity",
    "stroke.color": "stroke",
    "stroke.width": "stroke-width",
    "stroke.opacity": "stroke-opacity"
};
const SPACE = " ";

class PathNode extends Node {

    geometryChange() {
        this.attr("d", this.renderData());
        this.invalidate();
    }

    optionsChange(e) {
        switch (e.field) {
            case "fill":
                if (e.value) {
                    this.allAttr(this.mapFill(e.value));
                } else {
                    this.removeAttr("fill");
                }
                break;

            case "fill.color":
                this.allAttr(this.mapFill({ color: e.value }));
                break;

            case "stroke":
                if (e.value) {
                    this.allAttr(this.mapStroke(e.value));
                } else {
                    this.removeAttr("stroke");
                }
                break;

            case "transform":
                this.transformChange(e.value);
                break;

            default:
                const name = ATTRIBUTE_MAP[e.field];
                if (name) {
                    this.attr(name, e.value);
                }
                break;
        }

        super.optionsChange(e);
    }

    content() {
        if (this.element) {
            this.element.textContent = this.srcElement.content();
        }
    }

    renderData() {
        return this.printPath(this.srcElement);
    }

    printPath(path) {
        const segments = path.segments;
        const length = segments.length;
        if (length > 0) {
            const parts = [];
            let output, currentType;

            for (let i = 1; i < length; i++) {
                let segmentType = this.segmentType(segments[i - 1], segments[i]);
                if (segmentType !== currentType) {
                    currentType = segmentType;
                    parts.push(segmentType);
                }

                if (segmentType === "L") {
                    parts.push(this.printPoints(segments[i].anchor()));
                } else {
                    parts.push(this.printPoints(segments[i - 1].controlOut(), segments[i].controlIn(), segments[i].anchor()));
                }
            }

            output = "M" + this.printPoints(segments[0].anchor()) + SPACE + parts.join(SPACE);
            if (path.options.closed) {
                output += "Z";
            }

            return output;
        }
    }

    printPoints() {
        const points = arguments;
        const length = points.length;
        const result = [];

        for (let i = 0; i < length; i++) {
            result.push(points[i].toString(3));
        }

        return result.join(" ");
    }

    segmentType(segmentStart, segmentEnd) {
        return segmentStart.controlOut() && segmentEnd.controlIn() ? "C" : "L";
    }

    mapStroke(stroke) {
        const attrs = [];

        if (stroke && !isTransparent(stroke.color)) {
            attrs.push([ "stroke", stroke.color ]);
            attrs.push([ "stroke-width", stroke.width ]);
            attrs.push([ "stroke-linecap", this.renderLinecap(stroke) ]);
            attrs.push([ "stroke-linejoin", stroke.lineJoin ]);

            if (defined(stroke.opacity)) {
                attrs.push([ "stroke-opacity", stroke.opacity ]);
            }

            if (defined(stroke.dashType)) {
                attrs.push([ "stroke-dasharray", this.renderDashType(stroke) ]);
            }
        } else {
            attrs.push([ "stroke", NONE ]);
        }

        return attrs;
    }

    renderStroke() {
        return renderAllAttr(
            this.mapStroke(this.srcElement.options.stroke)
        );
    }

    renderDashType(stroke) {
        const { dashType, width = 1 } = stroke;

        if (dashType && dashType !== SOLID) {
            const dashArray = DASH_ARRAYS[dashType.toLowerCase()];
            const result = [];

            for (let i = 0; i < dashArray.length; i++) {
                result.push(dashArray[i] * width);
            }

            return result.join(" ");
        }
    }

    renderLinecap(stroke) {
        const { dashType, lineCap } = stroke;

        return (dashType && dashType !== "solid") ? BUTT : lineCap;
    }

    mapFill(fill) {
        const attrs = [];
        if (!(fill && fill.nodeType === "Gradient")) {
            if (fill && !isTransparent(fill.color)) {
                attrs.push([ "fill", fill.color ]);

                if (defined(fill.opacity)) {
                    attrs.push([ "fill-opacity", fill.opacity ]);
                }
            } else {
                attrs.push([ "fill", NONE ]);
            }
        }

        return attrs;
    }

    renderFill() {
        return renderAllAttr(
            this.mapFill(this.srcElement.options.fill)
        );
    }

    template() {
        return `<path ${ this.renderId() } ${ this.renderStyle() } ${ this.renderOpacity() } ${ renderAttr('d', this.renderData()) }` +
                    `${ this.renderStroke() }${ this.renderFill() }${ this.renderDefinitions() }${ this.renderTransform() }></path>`;
    }
}

NODE_MAP.Path = PathNode;

export default PathNode;