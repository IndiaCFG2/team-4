import { defined } from '../util';

class SurfaceCursor {

    constructor(surface) {
        surface.bind("mouseenter", this._mouseenter.bind(this));
        surface.bind("mouseleave", this._mouseleave.bind(this));

        this.element = surface.element;
    }

    clear() {
        this._resetCursor();
    }

    destroy() {
        this._resetCursor();
        delete this.element;
    }

    _mouseenter(e) {
        const cursor = this._shapeCursor(e);

        if (!cursor) {
            this._resetCursor();
        } else {
            if (!this._current) {
                this._defaultCursor = this._getCursor();
            }

            this._setCursor(cursor);
        }
    }

    _mouseleave() {
        this._resetCursor();
    }

    _shapeCursor(e) {
        let shape = e.element;

        while (shape && !defined(shape.options.cursor)) {
            shape = shape.parent;
        }

        if (shape) {
            return shape.options.cursor;
        }
    }

    _getCursor() {
        if (this.element) {
            return this.element.style.cursor;
        }
    }

    _setCursor(cursor) {
        if (this.element) {
            this.element.style.cursor = cursor;
            this._current = cursor;
        }
    }

    _resetCursor() {
        if (this._current) {
            this._setCursor(this._defaultCursor || "");
            delete this._current;
        }
    }
}

export default SurfaceCursor;

