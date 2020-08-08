import ObserversMixin from '../mixins/observers-mixin';
import StopsArray from './stops-array';
import GradientStop from './gradient-stop';
import { Class } from '../common';
import { defined, definitionId } from '../util';

class Gradient extends Class {

    constructor(options = {}) {
        super();

        this.stops = new StopsArray(this._createStops(options.stops));
        this.stops.addObserver(this);
        this._userSpace = options.userSpace;
        this.id = definitionId();
    }

    userSpace(value) {
        if (defined(value)) {
            this._userSpace = value;
            this.optionsChange();
            return this;
        }

        return this._userSpace;
    }

    _createStops(stops = []) {
        const result = [];
        for (let idx = 0; idx < stops.length; idx++) {
            result.push(GradientStop.create(stops[idx]));
        }

        return result;
    }

    addStop(offset, color, opacity) {
        this.stops.push(new GradientStop(offset, color, opacity));
    }

    removeStop(stop) {
        const index = this.stops.indexOf(stop);
        if (index >= 0) {
            this.stops.splice(index, 1);
        }
    }
}

Gradient.prototype.nodeType = "Gradient";

ObserversMixin.extend(Gradient.prototype);

Object.assign(Gradient.prototype, {
    optionsChange: function(e) {
        this.trigger("optionsChange", {
            field: "gradient" + (e ? "." + e.field : ""),
            value: this
        });
    },

    geometryChange: function() {
        this.optionsChange();
    }
});

export default Gradient;