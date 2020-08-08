import PathNode from './path-node';
import NODE_MAP from './node-map';
import { createPromise } from '../util';

class ImageNode extends PathNode {
    constructor(srcElement, cors) {
        super(srcElement);

        this.onLoad = this.onLoad.bind(this);
        this.onError = this.onError.bind(this);

        this.loading = createPromise();

        const img = this.img = new Image();

        if (cors && !(/^data:/i.test(srcElement.src()))) {
            img.crossOrigin = cors;
        }

        img.src = srcElement.src();

        if (img.complete) {
            this.onLoad();
        } else {
            img.onload = this.onLoad;
            img.onerror = this.onError;
        }
    }

    renderTo(ctx) {
        if (this.loading.state() === "resolved") {
            ctx.save();

            this.setTransform(ctx);
            this.setClip(ctx);

            this.drawImage(ctx);

            ctx.restore();
        }
    }

    optionsChange(e) {
        if (e.field === "src") {
            this.loading = createPromise();
            this.img.src = this.srcElement.src();
        } else {
            super.optionsChange(e);
        }
    }

    onLoad() {
        this.loading.resolve();
        this.invalidate();
    }

    onError() {
        this.loading.reject(new Error(
            "Unable to load image '" + this.img.src +
            "'. Check for connectivity and verify CORS headers."
        ));
    }

    drawImage(ctx) {
        const rect = this.srcElement.rect();
        const topLeft = rect.topLeft();

        ctx.drawImage(
            this.img, topLeft.x, topLeft.y, rect.width(), rect.height()
        );
    }
}

NODE_MAP.Image = ImageNode;

export default ImageNode;