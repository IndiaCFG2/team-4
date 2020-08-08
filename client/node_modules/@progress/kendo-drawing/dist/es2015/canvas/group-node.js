import Node from './node';
import Traversable from '../mixins/traversable';
import NODE_MAP from './node-map';

class GroupNode extends Node {

    renderTo(ctx) {
        if (!this.visible()) {
            return;
        }

        ctx.save();

        this.setTransform(ctx);
        this.setClip(ctx);
        this.setOpacity(ctx);

        const childNodes = this.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            let child = childNodes[i];
            if (child.visible()) {
                child.renderTo(ctx);
            }
        }

        ctx.restore();
    }
}

Traversable.extend(GroupNode.prototype, "childNodes");

NODE_MAP.Group = GroupNode;

export default GroupNode;