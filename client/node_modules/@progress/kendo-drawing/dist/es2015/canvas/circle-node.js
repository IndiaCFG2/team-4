import PathNode from './path-node';
import NODE_MAP from './node-map';

class CircleNode extends PathNode {
    renderPoints(ctx) {
        const { center, radius } = this.srcElement.geometry();

        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    }
}

NODE_MAP.Circle = CircleNode;

export default CircleNode;