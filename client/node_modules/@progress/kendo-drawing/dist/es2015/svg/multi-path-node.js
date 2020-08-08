import PathNode from './path-node';
import NODE_MAP from './node-map';

class MultiPathNode extends PathNode {
    renderData() {
        const paths = this.srcElement.paths;

        if (paths.length > 0) {
            const result = [];

            for (let i = 0; i < paths.length; i++) {
                result.push(this.printPath(paths[i]));
            }

            return result.join(" ");
        }
    }
}

NODE_MAP.MultiPath = MultiPathNode;

export default MultiPathNode;