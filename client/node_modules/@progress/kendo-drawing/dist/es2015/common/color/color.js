import Class from '../class';
import namedColors from './named-colors';
import { Bytes, RGB, HSV, HSL } from './parse-color';

const DARK_TRESHOLD = 180;

class Color extends Class {
    constructor(value) {
        super();

        if (arguments.length === 1) {
            const formats = Color.formats;
            const resolvedColor = this.resolveColor(value);

            for (let idx = 0; idx < formats.length; idx++) {
                const formatRegex = formats[idx].re;
                const processor = formats[idx].process;
                const parts = formatRegex.exec(resolvedColor);

                if (parts) {
                    const channels = processor(parts);
                    this.r = channels[0];
                    this.g = channels[1];
                    this.b = channels[2];
                }
            }
        } else {
            this.r = arguments[0];
            this.g = arguments[1];
            this.b = arguments[2];
        }

        this.r = this.normalizeByte(this.r);
        this.g = this.normalizeByte(this.g);
        this.b = this.normalizeByte(this.b);
    }

    toHex() {
        const pad = this.padDigit;
        const r = this.r.toString(16);
        const g = this.g.toString(16);
        const b = this.b.toString(16);

        return "#" + pad(r) + pad(g) + pad(b);
    }

    resolveColor(value) {
        let color = value || "black";

        if (color.charAt(0) === "#") {
            color = color.substr(1, 6);
        }

        color = color.replace(/ /g, "");
        color = color.toLowerCase();
        color = Color.namedColors[color] || color;

        return color;
    }

    normalizeByte(value) {
        if (value < 0 || isNaN(value)) {
            return 0;
        }

        return value > 255 ? 255 : value;
    }

    padDigit(value) {
        return (value.length === 1) ? "0" + value : value;
    }

    brightness(value) {
        const round = Math.round;

        this.r = round(this.normalizeByte(this.r * value));
        this.g = round(this.normalizeByte(this.g * value));
        this.b = round(this.normalizeByte(this.b * value));

        return this;
    }

    percBrightness() {
        return Math.sqrt(0.241 * this.r * this.r + 0.691 * this.g * this.g + 0.068 * this.b * this.b);
    }

    isDark() {
        return this.percBrightness() < DARK_TRESHOLD;
    }

    static fromBytes(r, g, b, a) {
        return new Bytes(r, g, b, a != null ? a : 1);
    }

    static fromRGB(r, g, b, a) {
        return new RGB(r, g, b, a != null ? a : 1);
    }

    static fromHSV(h, s, v, a) {
        return new HSV(h, s, v, a != null ? a : 1);
    }

    static fromHSL(h, s, l, a) {
        return new HSL(h, s, l, a != null ? a : 1);
    }
}

Color.formats = [ {
    re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
    process: function(parts) {
        return [
            parseInt(parts[1], 10), parseInt(parts[2], 10), parseInt(parts[3], 10)
        ];
    }
}, {
    re: /^(\w{2})(\w{2})(\w{2})$/,
    process: function(parts) {
        return [
            parseInt(parts[1], 16), parseInt(parts[2], 16), parseInt(parts[3], 16)
        ];
    }
}, {
    re: /^(\w{1})(\w{1})(\w{1})$/,
    process: function(parts) {
        return [
            parseInt(parts[1] + parts[1], 16),
            parseInt(parts[2] + parts[2], 16),
            parseInt(parts[3] + parts[3], 16)
        ];
    }
} ];

Color.namedColors = namedColors;

export default Color;