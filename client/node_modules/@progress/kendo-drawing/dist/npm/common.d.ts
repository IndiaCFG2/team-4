/**
 * @hidden
 * @param value
 * @param safe
 */
export function parseColor(value: string, safe?: boolean): any;

/**
 * @hidden
 *
 */
export const namedColors: any;

/**
 * @hidden
 *
 */
export class Color {
    constructor(value: any);

    toHex(): string;
    resolveColor(value: any): any;
    normalizeByte(value: any): any;
    padDigit(value: any): any;
    brightness(value: any): any;

    percBrightness(): number
    static fromBytes(r: any, g: any, b: any, a: any): any;
    static fromRGB(r: any, g: any, b: any, a: any): any;
    static fromHSV(h: any, s: any, v: any, a: any): any;
    static fromHSL(h: any, s: any, l: any, a: any): any;
}
