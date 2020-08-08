import PathNode from './path-node';
import renderStyle from './utils/render-style';
import renderAttr from './utils/render-attribute';
import NODE_MAP from './node-map';
import { htmlEncode, support } from '../common';
import { normalizeText } from '../text-metrics';

const ENTITY_REGEX = /&(?:[a-zA-Z]+|#\d+);/g;

function decodeEntities(text) {
    if (!text || typeof text !== "string" || !ENTITY_REGEX.test(text)) {
        return text;
    }

    const element = decodeEntities._element;
    ENTITY_REGEX.lastIndex = 0;

    return text.replace(ENTITY_REGEX, (match) => {
        element.innerHTML = match;

        return element.textContent || element.innerText;
    });
}

if (typeof document !== "undefined") {
    decodeEntities._element = document.createElement("span");
}

class TextNode extends PathNode {

    geometryChange() {
        const pos = this.pos();
        this.attr("x", pos.x);
        this.attr("y", pos.y);
        this.invalidate();
    }

    optionsChange(e) {
        if (e.field === "font") {
            this.attr("style", renderStyle(this.mapStyle()));
            this.geometryChange();
        } else if (e.field === "content") {
            super.content(this.srcElement.content());
        }

        super.optionsChange(e);
    }

    mapStyle(encode) {
        const style = super.mapStyle(encode);
        let font = this.srcElement.options.font;

        if (encode) {
            font = htmlEncode(font);
        }

        style.push([ "font", font ], [ "white-space", "pre" ]);

        return style;
    }

    pos() {
        const pos = this.srcElement.position();
        const size = this.srcElement.measure();
        return pos.clone().setY(pos.y + size.baseline);
    }

    renderContent() {
        let content = this.srcElement.content();
        content = decodeEntities(content);
        content = htmlEncode(content);

        return normalizeText(content);
    }

    renderTextAnchor() {
        let anchor;

        if ((this.options || {}).rtl && !(support.browser.msie || support.browser.edge)) {
            anchor = 'end';
        }

        return renderAttr("text-anchor", anchor);
    }

    template() {
        return `<text ${ this.renderId() } ${ this.renderTextAnchor() } ${ this.renderStyle() } ${ this.renderOpacity() }` +
                    `x='${ this.pos().x }' y='${ this.pos().y }' ${ this.renderStroke() } ${ this.renderTransform() } ${ this.renderDefinitions() }` +
                    `${ this.renderFill() }>${ this.renderContent() }</text>`;
    }
}

NODE_MAP.Text = TextNode;

export default TextNode;