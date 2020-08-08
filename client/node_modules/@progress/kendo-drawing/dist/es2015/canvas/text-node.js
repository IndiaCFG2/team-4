import PathNode from './path-node';
import NODE_MAP from './node-map';

class TextNode extends PathNode {
    renderTo(ctx) {
        const text = this.srcElement;
        const pos = text.position();
        const size = text.measure();

        ctx.save();

        this.setTransform(ctx);
        this.setClip(ctx);
        this.setOpacity(ctx);

        ctx.beginPath();

        ctx.font = text.options.font;
        ctx.textAlign = 'left';

        if (this.setFill(ctx)) {
            ctx.fillText(text.content(), pos.x, pos.y + size.baseline);
        }

        if (this.setStroke(ctx)) {
            this.setLineDash(ctx);
            ctx.strokeText(text.content(), pos.x, pos.y + size.baseline);
        }

        ctx.restore();
    }
}


NODE_MAP.Text = TextNode;

export default TextNode;