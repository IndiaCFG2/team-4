import GradientNode from './gradient-node';

class RadialGradientNode extends GradientNode {
    template() {
        return `<radialGradient id='${ this.id }' ${ this.renderCoordinates()}>${ this.renderChildren() }</radialGradient>`;
    }

    mapCoordinates() {
        const srcElement = this.srcElement;
        const center = srcElement.center();
        const radius = srcElement.radius();
        const attrs = [
            [ "cx", center.x ],
            [ "cy", center.y ],
            [ "r", radius ],
            this.mapSpace()
        ];
        return attrs;
    }
}

export default RadialGradientNode;