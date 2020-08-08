import { DashType } from './dash-type';
/**
 * The appearance settings for the note-connecting line.
 */
export interface NoteLine {
    /**
     * The color of the note line. Accepts a valid CSS color string, including hex and rgb.
     */
    color?: string;
    /**
     * The dash type of the note line.
     */
    dashType?: DashType;
    /**
     * The length of the connecting line in pixels.
     */
    length?: number;
    /**
     * The width of the connecting line in pixels.
     */
    width?: number;
}
