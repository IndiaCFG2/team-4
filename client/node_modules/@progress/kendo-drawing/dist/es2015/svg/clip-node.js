import Node from './node';

class ClipNode extends Node {
    constructor(srcElement) {
        super();

        this.srcElement = srcElement;
        this.id = srcElement.id;

        this.load([ srcElement ]);
    }

    template() {
        return `<clipPath id='${ this.id }'>${ this.renderChildren() }</clipPath>`;
    }
}

export default ClipNode;