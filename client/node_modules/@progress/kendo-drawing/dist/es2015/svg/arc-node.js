import PathNode from './path-node';
import NODE_MAP from './node-map';

class ArcNode extends PathNode {
    renderData() {
        return this.printPath(this.srcElement.toPath());
    }
}

NODE_MAP.Arc = ArcNode;

export default ArcNode;