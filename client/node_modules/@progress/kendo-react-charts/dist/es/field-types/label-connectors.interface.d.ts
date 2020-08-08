/**
 * The appearance settings for the label connectors on the Donut and Pie series.
 */
export interface LabelConnectors {
    /**
     * The color of the connecting line. Accepts a valid CSS color string, including hex and rgb.
     */
    color?: string;
    /**
     * The distance between the connector line and the main chart.
     */
    padding?: number;
    /**
     * The width of the connector line in pixels.
     */
    width?: number;
}
