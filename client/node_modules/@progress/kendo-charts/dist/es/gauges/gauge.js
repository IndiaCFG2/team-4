import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { Class, elementSize, setDefaultOptions, deepExtend, isArray, isNumber } from '../common';
import { DEFAULT_WIDTH, DEFAULT_HEIGHT } from './constants';
import { ChartService } from '../services';
import { unpad } from './utils';

var DEFAULT_MARGIN = 5;
var Path = drawing.Path;
var Surface = drawing.Surface;

var Gauge = (function (Class) {
    function Gauge(element, userOptions, theme, context) {
        if ( context === void 0 ) context = {};

        Class.call(this);

        this.element = element;
        this.theme = theme;
        this.contextService = new ChartService(this, context);
        this._originalOptions = deepExtend({}, this.options, userOptions);
        this.options = deepExtend({}, this._originalOptions);
        this._initTheme(theme);

        this.redraw();
    }

    if ( Class ) Gauge.__proto__ = Class;
    Gauge.prototype = Object.create( Class && Class.prototype );
    Gauge.prototype.constructor = Gauge;

    Gauge.prototype.destroy = function destroy () {
        if (this.surface) {
            this.surface.destroy();
            this.surface = null;
        }

        delete this.element;
        delete this.surfaceElement;
    };

    Gauge.prototype.value = function value (pointerValue) {
        var pointer = this.pointers[0];

        if (arguments.length === 0) {
            return pointer.value();
        }

        pointer.value(pointerValue);
        this._setValueOptions(pointerValue);
    };

    Gauge.prototype._draw = function _draw () {
        var surface = this.surface;

        surface.clear();
        surface.draw(this._visuals);
    };

    Gauge.prototype.exportVisual = function exportVisual () {
        return this._visuals;
    };

    Gauge.prototype.allValues = function allValues (values) {
        var pointers = this.pointers;
        var allValues = [];

        if (arguments.length === 0) {
            for (var i = 0; i < pointers.length; i++) {
                allValues.push(pointers[i].value());
            }

            return allValues;
        }

        if (isArray(values)) {
            for (var i$1 = 0; i$1 < values.length; i$1++) {
                if (isNumber(values[i$1])) {
                    pointers[i$1].value(values[i$1]);
                }
            }
        }

        this._setValueOptions(values);
    };

    Gauge.prototype._setValueOptions = function _setValueOptions (values) {
        var pointers = [].concat(this.options.pointer);
        var arrayValues = [].concat(values);

        for (var i = 0; i < arrayValues.length; i++) {
            pointers[i].value = arrayValues[i];
        }
    };

    Gauge.prototype.resize = function resize () {
        this.noTransitionsRedraw();
    };

    Gauge.prototype.noTransitionsRedraw = function noTransitionsRedraw () {
        var transitions = this.options.transitions;

        this._toggleTransitions(false);

        this.redraw();

        this._toggleTransitions(transitions);
    };

    Gauge.prototype.redraw = function redraw () {
        var size = this._surfaceSize();
        var wrapper = new geo.Rect([ 0, 0 ], [ size.width, size.height ]);

        this._initSurface();

        this.gaugeArea = this._createGaugeArea();

        this._createModel();

        var bbox = unpad(wrapper.bbox(), this._gaugeAreaMargin);
        this.reflow(bbox);
    };

    Gauge.prototype.setOptions = function setOptions (options, theme) {
        this._originalOptions = deepExtend(this._originalOptions, options);
        this.options = deepExtend({}, this._originalOptions);

        this._initTheme(theme);

        this.redraw();
    };

    Gauge.prototype.setDirection = function setDirection (rtl) {
        this.contextService.rtl = Boolean(rtl);
        if (this.surface && this.surface.type === 'svg') {
            this.surface.destroy();
            this.surface = null;
        }
    };

    Gauge.prototype.setIntlService = function setIntlService (intl) {
        this.contextService.intl = intl;
    };

    Gauge.prototype._initTheme = function _initTheme (theme) {
        var currentTheme = theme || this.theme || {};
        this.theme = currentTheme;

        this.options = deepExtend({}, currentTheme, this.options);
        var options = this.options;
        var pointer = options.pointer;

        if (isArray(pointer)) {
            var pointers = [];
            for (var i = 0; i < pointer.length; i++) {
                pointers.push(deepExtend({}, currentTheme.pointer, pointer[i]));
            }
            options.pointer = pointers;
        }
    };

    Gauge.prototype._createGaugeArea = function _createGaugeArea () {
        var options = this.options.gaugeArea;
        var size = this.surface.size();
        var border = options.border || {};
        var areaGeometry = new geo.Rect([ 0, 0 ], [ size.width, size.height ]);

        this._gaugeAreaMargin = options.margin || DEFAULT_MARGIN;

        if (border.width > 0) {
            areaGeometry = unpad(areaGeometry, border.width);
        }

        var gaugeArea = Path.fromRect(areaGeometry, {
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
    };

    Gauge.prototype._initSurface = function _initSurface () {
        var ref = this;
        var options = ref.options;
        var surface = ref.surface;
        var element = this._surfaceElement();
        var size = this._surfaceSize();

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
    };

    Gauge.prototype._surfaceSize = function _surfaceSize () {
        var options = this.options;
        var size = this._getSize();

        if (options.gaugeArea) {
            deepExtend(size, options.gaugeArea);
        }

        return size;
    };

    Gauge.prototype._surfaceElement = function _surfaceElement () {
        if (!this.surfaceElement) {
            this.surfaceElement = document.createElement('div');
            this.element.appendChild(this.surfaceElement);
        }

        return this.surfaceElement;
    };

    Gauge.prototype.getSize = function getSize () {
        return this._getSize();
    };

    Gauge.prototype._getSize = function _getSize () {
        var element = this.element;
        var defaultSize = this._defaultSize();
        var width = element.offsetWidth;
        var height = element.offsetHeight;

        if (!width) {
            width = defaultSize.width;
        }

        if (!height) {
            height = defaultSize.height;
        }

        return { width: width, height: height };
    };

    Gauge.prototype._defaultSize = function _defaultSize () {
        return {
            width: DEFAULT_WIDTH,
            height: DEFAULT_HEIGHT
        };
    };

    Gauge.prototype._toggleTransitions = function _toggleTransitions (value) {
        var this$1 = this;

        this.options.transitions = value;
        for (var i = 0; i < this.pointers.length; i++) {
            this$1.pointers[i].options.animation.transitions = value;
        }
    };

    return Gauge;
}(Class));

setDefaultOptions(Gauge, {
    plotArea: {},
    theme: "default",
    renderAs: "",
    pointer: {},
    scale: {},
    gaugeArea: {}
});

export default Gauge;