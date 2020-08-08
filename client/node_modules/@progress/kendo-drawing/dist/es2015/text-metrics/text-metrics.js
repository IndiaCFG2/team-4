import LRUCache from './lru-cache';
import { Class } from '../common';
import { objectKey, hashKey, normalizeText } from './util';

function zeroSize() {
    return { width: 0, height: 0, baseline: 0 };
}

const DEFAULT_OPTIONS = {
    baselineMarkerSize: 1
};

let defaultMeasureBox;

if (typeof document !== "undefined") {
    defaultMeasureBox = document.createElement("div");
    defaultMeasureBox.style.cssText = "position: absolute !important; top: -4000px !important; width: auto !important; height: auto !important;" +
              "padding: 0 !important; margin: 0 !important; border: 0 !important;" +
              "line-height: normal !important; visibility: hidden !important; white-space: pre!important;";
}

class TextMetrics extends Class {
    constructor(options) {
        super();

        this._cache = new LRUCache(1000);
        this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    }

    measure(text, style, options = {}) {
        if (!text) {
            return zeroSize();
        }

        const styleKey = objectKey(style);
        const cacheKey = hashKey(text + styleKey);
        const cachedResult = this._cache.get(cacheKey);

        if (cachedResult) {
            return cachedResult;
        }

        const size = zeroSize();
        const measureBox = options.box || defaultMeasureBox;
        const baselineMarker = this._baselineMarker().cloneNode(false);

        for (let key in style) {
            let value = style[key];
            if (typeof value !== "undefined") {
                measureBox.style[key] = value;
            }
        }

        const textStr = options.normalizeText !== false ? normalizeText(text) : String(text);

        measureBox.textContent = textStr;
        measureBox.appendChild(baselineMarker);
        document.body.appendChild(measureBox);

        if (textStr.length) {
            size.width = measureBox.offsetWidth - this.options.baselineMarkerSize;
            size.height = measureBox.offsetHeight;
            size.baseline = baselineMarker.offsetTop + this.options.baselineMarkerSize;
        }

        if (size.width > 0 && size.height > 0) {
            this._cache.put(cacheKey, size);
        }

        measureBox.parentNode.removeChild(measureBox);

        return size;
    }

    _baselineMarker() {
        const marker = document.createElement("div");
        marker.style.cssText = "display: inline-block; vertical-align: baseline;width: " +
            this.options.baselineMarkerSize + "px; height: " + this.options.baselineMarkerSize + "px;overflow: hidden;";

        return marker;
    }
}

TextMetrics.current = new TextMetrics();

export default TextMetrics;