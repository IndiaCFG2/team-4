import PathNode from './path-node';
import NODE_MAP from './node-map';
import renderPath from './utils/render-path';

class ArcNode extends PathNode {
    renderPoints(ctx) {
        const path = this.srcElement.toPath();
        renderPath(ctx, path);
    }
}

NODE_MAP.Arc = ArcNode;

export default ArcNode;