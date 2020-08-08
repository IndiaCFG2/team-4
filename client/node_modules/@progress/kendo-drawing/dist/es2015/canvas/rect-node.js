import PathNode from './path-node';
import NODE_MAP from './node-map';

class RectNode extends PathNode {
    renderPoints(ctx) {
        const { origin, size } = this.srcElement.geometry();

        ctx.rect(origin.x, origin.y, size.width, size.height);
    }
}

NODE_MAP.Rect = RectNode;

export default RectNode;