import BaseSurface from '../core/surface';
import SurfaceFactory from '../core/surface-factory';
import RootNode from './root-node';
import Group from '../shapes/group';
import transform from '../geometry/transform';
import renderSVG from './utils/render-svg';
import { SVG_NS } from './constants';
import { bindEvents, unbindEvents, elementStyles } from '../util';

const RTL = 'rtl';

function alignToScreen(element) {
    let ctm;

    try {
        ctm = element.getScreenCTM ? element.getScreenCTM() : null;
    } catch (e) { } // eslint-disable-line no-empty

    if (ctm) {
        const left = - ctm.e % 1;
        const top = - ctm.f % 1;
        const style = element.style;

        if (left !== 0 || top !== 0) {
            style.left = left + "px";
            style.top = top + "px";
        }
    }
}

class Surface extends BaseSurface {
    constructor(element, options) {
        super(element, options);

        this._root = new RootNode(Object.assign({
            rtl: elementStyles(element, 'direction').direction === RTL
        }, this.options));

        renderSVG(this.element, this._template());

        this._rootElement = this.element.firstElementChild;

        alignToScreen(this._rootElement);

        this._root.attachTo(this._rootElement);

        bindEvents(this.element, {
            click: this._click,
            mouseover: this._mouseenter,
            mouseout: this._mouseleave,
            mousemove: this._mousemove
        });

        this.resize();
    }

    destroy() {
        if (this._root) {
            this._root.destroy();
            this._root = null;
            this._rootElement = null;
            unbindEvents(this.element, {
                click: this._click,
                mouseover: this._mouseenter,
                mouseout: this._mouseleave,
                mousemove: this._mousemove
            });
        }

        super.destroy();
    }

    translate(offset) {
        const viewBox = `${ Math.round(offset.x) } ${ Math.round(offset.y) } ${ this._size.width } ${ this._size.height }`;

        this._offset = offset;
        this._rootElement.setAttribute("viewBox", viewBox);
    }

    draw(element) {
        super.draw(element);
        this._root.load([ element ]);
    }

    clear() {
        super.clear();
        this._root.clear();
    }

    svg() {
        return "<?xml version='1.0' ?>" + this._template();
    }

    exportVisual() {
        let { _visual: visual, _offset: offset } = this;

        if (offset) {
            const wrap = new Group();
            wrap.children.push(visual);

            wrap.transform(
                transform().translate(-offset.x, -offset.y)
            );

            visual = wrap;
        }

        return visual;
    }

    _resize() {
        if (this._offset) {
            this.translate(this._offset);
        }
    }

    _template() {
        return `<svg style='width: 100%; height: 100%; overflow: hidden;' xmlns='${ SVG_NS }' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1'>${ this._root.render() }</svg>`;
    }
}

Surface.prototype.type = "svg";

if (typeof document !== "undefined" && document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1")) {
    BaseSurface.support.svg = true;
    SurfaceFactory.current.register("svg", Surface, 10);
}

export default Surface;