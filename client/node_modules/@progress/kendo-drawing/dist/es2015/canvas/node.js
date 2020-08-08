import BaseNode from '../core/base-node';
import NODE_MAP from './node-map';
import renderPath from './utils/render-path';
import { defined } from '../util';

class Node extends BaseNode {
    constructor(srcElement) {
        super(srcElement);
        if (srcElement) {
            this.initClip();
        }
    }

    initClip() {
        const clip = this.srcElement.clip();
        if (clip) {
            this.clip = clip;
            clip.addObserver(this);
        }
    }

    clear() {
        if (this.srcElement) {
            this.srcElement.removeObserver(this);
        }

        this.clearClip();

        super.clear();
    }

    clearClip() {
        if (this.clip) {
            this.clip.removeObserver(this);
            delete this.clip;
        }
    }

    setClip(ctx) {
        if (this.clip) {
            ctx.beginPath();
            renderPath(ctx, this.clip);
            ctx.clip();
        }
    }

    optionsChange(e) {
        if (e.field === "clip") {
            this.clearClip();
            this.initClip();
        }

        super.optionsChange(e);
    }

    setTransform(ctx) {
        if (this.srcElement) {
            const transform = this.srcElement.transform();
            if (transform) {
                ctx.transform.apply(ctx, transform.matrix().toArray(6));
            }
        }
    }

    loadElements(elements, pos, cors) {
        for (let i = 0; i < elements.length; i++) {
            let srcElement = elements[i];
            let children = srcElement.children;

            let childNode = new NODE_MAP[srcElement.nodeType](srcElement, cors);

            if (children && children.length > 0) {
                childNode.load(children, pos, cors);
            }

            if (defined(pos)) {
                this.insertAt(childNode, pos);
            } else {
                this.append(childNode);
            }
        }
    }

    load(elements, pos, cors) {
        this.loadElements(elements, pos, cors);

        this.invalidate();
    }

    setOpacity(ctx) {
        if (this.srcElement) {
            const opacity = this.srcElement.opacity();
            if (defined(opacity)) {
                this.globalAlpha(ctx, opacity);
            }
        }
    }

    globalAlpha(ctx, value) {
        let opactity = value;
        if (opactity && ctx.globalAlpha) {
            opactity *= ctx.globalAlpha;
        }
        ctx.globalAlpha = opactity;
    }

    visible() {
        const src = this.srcElement;
        return !src || (src && src.options.visible !== false);
    }
}

export default Node;