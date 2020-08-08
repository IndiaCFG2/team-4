import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { Class, elementSize, setDefaultOptions, deepExtend, isArray, isNumber } from '../common';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './constants';
import { ChartService } from '../services';
import { unpad } from './utils';

const DEFAULT_MARGIN = 5;
const { Path, Surface } = drawing;

class Gauge extends Class {

    constructor(element, userOptions, theme, context = {}) {
        super();

        this.element = element;
        this.theme = theme;
        this.contextService = new ChartService(this, context);
        this._originalOptions = deepExtend({}, this.options, userOptions);
        this.options = deepExtend({}, this._originalOptions);
        this._initTheme(theme);

        this.redraw();
    }

    destroy() {
        if (this.surface) {
            this.surface.destroy();
            this.surface = null;
        }

        delete this.element;
        delete this.surfaceElement;
    }

    value(pointerValue) {
        const pointer = this.pointers[0];

        if (arguments.length === 0) {
            return pointer.value();
        }

        pointer.value(pointerValue);
        this._setValueOptions(pointerValue);
    }

    _draw() {
        const surface = this.surface;

        surface.clear();
        surface.draw(this._visuals);
    }

    exportVisual() {
        return this._visuals;
    }

    allValues(values) {
        const pointers = this.pointers;
        const allValues = [];

        if (arguments.length === 0) {
            for (let i = 0; i < pointers.length; i++) {
                allValues.push(pointers[i].value());
            }

            return allValues;
        }

        if (isArray(values)) {
            for (let i = 0; i < values.length; i++) {
                if (isNumber(values[i])) {
                    pointers[i].value(values[i]);
                }
            }
        }

        this._setValueOptions(values);
    }

    _setValueOptions(values) {
        const pointers = [].concat(this.options.pointer);
        const arrayValues = [].concat(values);

        for (let i = 0; i < arrayValues.length; i++) {
            pointers[i].value = arrayValues[i];
        }
    }

    resize() {
        this.noTransitionsRedraw();
    }

    noTransitionsRedraw() {
        const transitions = this.options.transitions;

        this._toggleTransitions(false);

        this.redraw();

        this._toggleTransitions(transitions);
    }

    redraw() {
        const size = this._surfaceSize();
        const wrapper = new geo.Rect([ 0, 0 ], [ size.width, size.height ]);

        this._initSurface();

        this.gaugeArea = this._createGaugeArea();

        this._createModel();

        const bbox = unpad(wrapper.bbox(), this._gaugeAreaMargin);
        this.reflow(bbox);
    }

    setOptions(options, theme) {
        this._originalOptions = deepExtend(this._originalOptions, options);
        this.options = deepExtend({}, this._originalOptions);

        this._initTheme(theme);

        this.redraw();
    }

    setDirection(rtl) {
        this.contextService.rtl = Boolean(rtl);
        if (this.surface && this.surface.type === 'svg') {
            this.surface.destroy();
            this.surface = null;
        }
    }

    setIntlService(intl) {
        this.contextService.intl = intl;
    }

    _initTheme(theme) {
        let currentTheme = theme || this.theme || {};
        this.theme = currentTheme;

        this.options = deepExtend({}, currentTheme, this.options);
        const options = this.options;
        const pointer = options.pointer;

        if (isArray(pointer)) {
            const pointers = [];
            for (let i = 0; i < pointer.length; i++) {
                pointers.push(deepExtend({}, currentTheme.pointer, pointer[i]));
            }
            options.pointer = pointers;
        }
    }

    _createGaugeArea() {
        const options = this.options.gaugeArea;
        const size = this.surface.size();
        const border = options.border || {};
        let areaGeometry = new geo.Rect([ 0, 0 ], [ size.width, size.height ]);

        this._gaugeAreaMargin = options.margin || DEFAULT_MARGIN;

        if (border.width > 0) {
            areaGeometry = unpad(areaGeometry, border.width);
        }

        const gaugeArea = Path.fromRect(areaGeometry, {
            stroke: {
                color: border.width ? border.color : "",
                width: border.width,
                dashType: border.dashType,
                lineJoin: "round",
                lineCap: "round"
            },
            fill: {
                color: options.background
            }
        });

        return gaugeArea;
    }

    _initSurface() {
        const { options, surface } = this;
        const element = this._surfaceElement();
        const size = this._surfaceSize();

        elementSize(element, size);

        if (!surface || surface.options.type !== options.renderAs) {
            if (surface) {
                surface.destroy();
            }

            this.surface = Surface.create(element, {
                type: options.renderAs
            });
        } else {
            this.surface.clear();
            this.surface.resize();
        }
    }

    _surfaceSize() {
        const options = this.options;
        const size = this._getSize();

        if (options.gaugeArea) {
            deepExtend(size, options.gaugeArea);
        }

        return size;
    }

    _surfaceElement() {
        if (!this.surfaceElement) {
            this.surfaceElement = document.createElement('div');
            this.element.appendChild(this.surfaceElement);
        }

        return this.surfaceElement;
    }

    getSize() {
        return this._getSize();
    }

    _getSize() {
        const element = this.element;
        const defaultSize = this._defaultSize();
        let width = element.offsetWidth;
        let height = element.offsetHeight;

        if (!width) {
            width = defaultSize.width;
        }

        if (!height) {
            height = defaultSize.height;
        }

        return { width: width, height: height };
    }

    _defaultSize() {
        return {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
        };
    }

    _toggleTransitions(value) {
        this.options.transitions = value;
        for (let i = 0; i < this.pointers.length; i++) {
            this.pointers[i].options.animation.transitions = value;
        }
    }
}

setDefaultOptions(Gauge, {
    plotArea: {},
    theme: "default",
    renderAs: "",
    pointer: {},
    scale: {},
    gaugeArea: {}
});

export default Gauge;