import Class from '../class';
import support from '../support';
import namedColors from './named-colors';

const browser = support.browser;

let matchNamedColor = (color) => {
    const colorNames = Object.keys(namedColors);
    colorNames.push("transparent");

    const regexp = new RegExp("^(" + colorNames.join("|") + ")(\\W|$)", "i");
    matchNamedColor = (color) => regexp.exec(color);

    return regexp.exec(color);
};

class BaseColor extends Class {
    constructor() { super(); }
    toHSV() { return this; }

    toRGB() { return this; }

    toHex() { return this.toBytes().toHex(); }

    toBytes() { return this; }

    toCss() { return "#" + this.toHex(); }

    toCssRgba() {
        const rgb = this.toBytes();
        return `rgba(${ rgb.r }, ${ rgb.g }, ${ rgb.b }, ${ parseFloat((Number(this.a)).toFixed(3)) })`;
    }

    toDisplay() {
        if (browser.msie && browser.version < 9) {
            return this.toCss(); // no RGBA support; does it support any opacity in colors?
        }
        return this.toCssRgba();
    }

    equals(c) {
        return c === this || c !== null && this.toCssRgba() === parseColor(c).toCssRgba();
    }

    diff(other) {
        if (other === null) {
            return NaN;
        }

        const c1 = this.toBytes();
        const c2 = other.toBytes();

        return Math.sqrt(Math.pow((c1.r - c2.r) * 0.30, 2) +
                         Math.pow((c1.g - c2.g) * 0.59, 2) +
                         Math.pow((c1.b - c2.b) * 0.11, 2));
    }

    clone() {
        let c = this.toBytes();
        if (c === this) {
            c = new Bytes(c.r, c.g, c.b, c.a);
        }

        return c;
    }
}

class RGB extends BaseColor {
    constructor(r, g, b, a) {
        super();

        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toHSV() {
        const { r, g, b } = this;
        const min = Math.min(r, g, b);
        const max = Math.max(r, g, b);
        const delta = max - min;
        const v = max;
        let h, s;

        if (delta === 0) {
            return new HSV(0, 0, v, this.a);
        }

        if (max !== 0) {
            s = delta / max;
            if (r === max) {
                h = (g - b) / delta;
            } else if (g === max) {
                h = 2 + (b - r) / delta;
            } else {
                h = 4 + (r - g) / delta;
            }

            h *= 60;
            if (h < 0) {
                h += 360;
            }
        } else {
            s = 0;
            h = -1;
        }

        return new HSV(h, s, v, this.a);
    }

    toHSL() {
        const { r, g, b } = this;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
                default: break;
            }
        }

        return new HSL(h * 60, s * 100, l * 100, this.a);
    }

    toBytes() {
        return new Bytes(this.r * 255, this.g * 255, this.b * 255, this.a);
    }
}

class Bytes extends RGB {
    constructor(r, g, b, a) {
        super(Math.round(r), Math.round(g), Math.round(b), a);
    }

    toRGB() {
        return new RGB(this.r / 255, this.g / 255, this.b / 255, this.a);
    }

    toHSV() {
        return this.toRGB().toHSV();
    }

    toHSL() {
        return this.toRGB().toHSL();
    }

    toHex() {
        return hex(this.r, 2) + hex(this.g, 2) + hex(this.b, 2);
    }

    toBytes() {
        return this;
    }
}

function hex(n, width, pad = "0") {
    let result = n.toString(16);
    while (width > result.length) {
        result = pad + result;
    }

    return result;
}

class HSV extends BaseColor {
    constructor(h, s, v, a) {
        super();

        this.h = h;
        this.s = s;
        this.v = v;
        this.a = a;
    }

    toRGB() {
        let { h, s, v } = this;
        let r, g, b;

        if (s === 0) {
            r = g = b = v;
        } else {
            h /= 60;

            const i = Math.floor(h);
            const f = h - i;
            const p = v * (1 - s);
            const q = v * (1 - s * f);
            const t = v * (1 - s * (1 - f));

            switch (i) {
                case 0: r = v; g = t; b = p; break;
                case 1: r = q; g = v; b = p; break;
                case 2: r = p; g = v; b = t; break;
                case 3: r = p; g = q; b = v; break;
                case 4: r = t; g = p; b = v; break;
                default: r = v; g = p; b = q; break;
            }
        }

        return new RGB(r, g, b, this.a);
    }

    toHSL() {
        return this.toRGB().toHSL();
    }

    toBytes() {
        return this.toRGB().toBytes();
    }
}

class HSL extends BaseColor {
    constructor(h, s, l, a) {
        super();

        this.h = h;
        this.s = s;
        this.l = l;
        this.a = a;
    }

    toRGB() {
        let h = this.h / 360;
        let s = this.s / 100;
        let l = this.l / 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return new RGB(r, g, b, this.a);
    }

    toHSV() {
        return this.toRGB().toHSV();
    }

    toBytes() {
        return this.toRGB().toBytes();
    }
}

function hue2rgb(p, q, s) {
    let t = s;

    if (t < 0) {
        t += 1;
    }

    if (t > 1) {
        t -= 1;
    }

    if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
    }

    if (t < 1 / 2) {
        return q;
    }

    if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
    }

    return p;
}

export { RGB, Bytes, HSV, HSL };

export default function parseColor(value, safe) {
    let m, ret;

    if (value == null || value === "none") {
        return null;
    }

    if (value instanceof BaseColor) {
        return value;
    }

    let color = value.toLowerCase();
    if ((m = matchNamedColor(color))) {
        if (m[1] === "transparent") {
            color = new RGB(1, 1, 1, 0);
        } else {
            color = parseColor(namedColors[m[1]], safe);
        }
        color.match = [ m[1] ];
        return color;
    }
    if ((m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})\b/i.exec(color))) {
        ret = new Bytes(parseInt(m[1], 16),
                        parseInt(m[2], 16),
                        parseInt(m[3], 16), 1);
    } else if ((m = /^#?([0-9a-f])([0-9a-f])([0-9a-f])\b/i.exec(color))) {
        ret = new Bytes(parseInt(m[1] + m[1], 16),
                        parseInt(m[2] + m[2], 16),
                        parseInt(m[3] + m[3], 16), 1);
    } else if ((m = /^rgb\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)/.exec(color))) {
        ret = new Bytes(parseInt(m[1], 10),
                        parseInt(m[2], 10),
                        parseInt(m[3], 10), 1);
    } else if ((m = /^rgba\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9.]+)\s*\)/.exec(color))) {
        ret = new Bytes(parseInt(m[1], 10),
                        parseInt(m[2], 10),
                        parseInt(m[3], 10), parseFloat(m[4]));
    } else if ((m = /^rgb\(\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*\)/.exec(color))) {
        ret = new RGB(parseFloat(m[1]) / 100,
                      parseFloat(m[2]) / 100,
                      parseFloat(m[3]) / 100, 1);
    } else if ((m = /^rgba\(\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9]*\.?[0-9]+)%\s*,\s*([0-9.]+)\s*\)/.exec(color))) {
        ret = new RGB(parseFloat(m[1]) / 100,
                      parseFloat(m[2]) / 100,
                      parseFloat(m[3]) / 100, parseFloat(m[4]));
    }

    if (ret) {
        ret.match = m;
    } else if (!safe) {
        throw new Error("Cannot parse color: " + color);
    }

    return ret;
}
