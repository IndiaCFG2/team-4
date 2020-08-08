import PathNode from './path-node';
import NODE_MAP from './node-map';
import renderPath from './utils/render-path';

class MultiPathNode extends PathNode {
    renderPoints(ctx) {
        const paths = this.srcElement.paths;
        for (let i = 0; i < paths.length; i++) {
            renderPath(ctx, paths[i]);
        }
    }
}

NODE_MAP.MultiPath = MultiPathNode;

export default MultiPathNode;