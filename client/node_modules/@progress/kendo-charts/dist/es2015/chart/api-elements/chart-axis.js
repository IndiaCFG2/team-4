import { Class } from '../../common';

class ChartAxis extends Class {
    constructor(axis) {
        super();

        this._axis = axis;
        this.options = axis.options;
    }

    value(point) {
        const axis = this._axis;
        const value = axis.getCategory ? axis.getCategory(point) : axis.getValue(point);

        return value;
    }

    slot(from, to, limit = true) {
        return this._axis.slot(from, to, limit);
    }

    range() {
        return this._axis.range();
    }

    valueRange() {
        return this._axis.valueRange();
    }
}

export default ChartAxis;