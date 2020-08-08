import GradientNode from './gradient-node';

class LinearGradientNode extends GradientNode {
    template() {
        return `<linearGradient id='${ this.id }' ${ this.renderCoordinates() }>${ this.renderChildren() }</linearGradient>`;
    }

    mapCoordinates() {
        const srcElement = this.srcElement;
        const start = srcElement.start();
        const end = srcElement.end();
        const attrs = [
            [ "x1", start.x ],
            [ "y1", start.y ],
            [ "x2", end.x ],
            [ "y2", end.y ],
            this.mapSpace()
        ];

        return attrs;
    }
}

export default LinearGradientNode;