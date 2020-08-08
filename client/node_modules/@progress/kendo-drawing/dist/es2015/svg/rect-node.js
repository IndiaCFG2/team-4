import PathNode from './path-node';
import NODE_MAP from './node-map';

class RectNode extends PathNode {

    geometryChange() {
        const geometry = this.srcElement.geometry();
        this.attr("x", geometry.origin.x);
        this.attr("y", geometry.origin.y);
        this.attr("width", geometry.size.width);
        this.attr("height", geometry.size.height);
        this.invalidate();
    }

    size() {
        return this.srcElement.geometry().size;
    }

    origin() {
        return this.srcElement.geometry().origin;
    }

    template() {
        return `<rect ${ this.renderId() } ${ this.renderStyle() } ${ this.renderOpacity() } x='${ this.origin().x }' y='${ this.origin().y }' ` +
                    `width='${ this.size().width }' height='${ this.size().height }' ${ this.renderStroke() } ` +
                    `${ this.renderFill() } ${ this.renderDefinitions() } ${ this.renderTransform() } />`;
    }
}

NODE_MAP.Rect = RectNode;

export default RectNode;