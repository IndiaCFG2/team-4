import Element from './element';
import Point from '../geometry/point';
import Rect from '../geometry/rect';
import toMatrix from '../geometry/to-matrix';
import Paintable from '../mixins/paintable';
import definePointAccessors from '../accessors/define-point-accessors';
import { defined, measureText } from '../util';

const DEFAULT_FONT = "12px sans-serif";
const DEFAULT_FILL = "#000";

class Text extends Element {

    constructor(content, position = new Point(), options = {}) {
        super(options);

        this.content(content);
        this.position(position);

        if (!this.options.font) {
            this.options.font = DEFAULT_FONT;
        }

        if (!defined(this.options.fill)) {
            this.fill(DEFAULT_FILL);
        }
    }

    content(value) {
        if (defined(value)) {
            this.options.set("content", value);
            return this;
        }

        return this.options.get("content");
    }

    measure() {
        const metrics = measureText(this.content(), {
            font: this.options.get("font")
        });

        return metrics;
    }

    rect() {
        const size = this.measure();
        const pos = this.position().clone();
        return new Rect(pos, [ size.width, size.height ]);
    }

    bbox(transformation) {
        const combinedMatrix = toMatrix(this.currentTransform(transformation));
        return this.rect().bbox(combinedMatrix);
    }

    rawBBox() {
        return this.rect().bbox();
    }

    _containsPoint(point) {
        return this.rect().containsPoint(point);
    }
}

Text.prototype.nodeType = "Text";

Paintable.extend(Text.prototype);

definePointAccessors(Text.prototype, [ "position" ]);

export default Text;