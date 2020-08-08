import { support } from '@progress/kendo-drawing';

const browser = support.browser || {};

const INITIAL_ANIMATION_DURATION = 600;
const FADEIN = "fadeIn";

const GLASS = "glass";
const BORDER_BRIGHTNESS = 0.8;
const TOOLTIP_OFFSET = 5;
const START_SCALE = browser.msie ? 0.001 : 0;
const ERROR_LOW_FIELD = "errorLow";
const ERROR_HIGH_FIELD = "errorHigh";
const X_ERROR_LOW_FIELD = "xErrorLow";
const X_ERROR_HIGH_FIELD = "xErrorHigh";
const Y_ERROR_LOW_FIELD = "yErrorLow";
const Y_ERROR_HIGH_FIELD = "yErrorHigh";
const LINE_MARKER_SIZE = 8;
const ZERO = "zero";
const INTERPOLATE = "interpolate";
const GAP = "gap";
const ABOVE = "above";
const BELOW = "below";

const SMOOTH = "smooth";
const STEP = "step";

const AREA = "area";
const BAR = "bar";
const BOX_PLOT = "boxPlot";
const BUBBLE = "bubble";
const BULLET = "bullet";
const CANDLESTICK = "candlestick";
const COLUMN = "column";
const DONUT = "donut";
const FUNNEL = "funnel";
const HORIZONTAL_WATERFALL = "horizontalWaterfall";
const LINE = "line";
const OHLC = "ohlc";
const PIE = "pie";
const POLAR_AREA = "polarArea";
const POLAR_LINE = "polarLine";
const POLAR_SCATTER = "polarScatter";
const RADAR_AREA = "radarArea";
const RADAR_COLUMN = "radarColumn";
const RADAR_LINE = "radarLine";
const RANGE_AREA = "rangeArea";
const RANGE_BAR = "rangeBar";
const RANGE_COLUMN = "rangeColumn";
const SCATTER = "scatter";
const SCATTER_LINE = "scatterLine";
const VERTICAL_AREA = "verticalArea";
const VERTICAL_BOX_PLOT = "verticalBoxPlot";
const VERTICAL_BULLET = "verticalBullet";
const VERTICAL_LINE = "verticalLine";
const VERTICAL_RANGE_AREA = "verticalRangeArea";
const WATERFALL = "waterfall";
const EQUALLY_SPACED_SERIES = [
    BAR, COLUMN, OHLC, CANDLESTICK, BOX_PLOT, VERTICAL_BOX_PLOT,
    BULLET, RANGE_COLUMN, RANGE_BAR, WATERFALL, HORIZONTAL_WATERFALL
];

const LEGEND_ITEM_CLICK = "legendItemClick";
const LEGEND_ITEM_HOVER = "legendItemHover";
const LEGEND_ITEM_LEAVE = "legendItemLeave";
const SERIES_CLICK = "seriesClick";
const SERIES_HOVER = "seriesHover";
const SERIES_OVER = "seriesOver";
const SERIES_LEAVE = "seriesLeave";
const PLOT_AREA_CLICK = "plotAreaClick";
const PLOT_AREA_HOVER = "plotAreaHover";
const PLOT_AREA_LEAVE = "plotAreaLeave";
const DRAG = "drag";
const DRAG_END = "dragEnd";
const DRAG_START = "dragStart";
const ZOOM_START = "zoomStart";
const ZOOM = "zoom";
const ZOOM_END = "zoomEnd";
const SELECT_START = "selectStart";
const SELECT = "select";
const SELECT_END = "selectEnd";
const RENDER = "render";
const SHOW_TOOLTIP = "showTooltip";
const HIDE_TOOLTIP = "hideTooltip";
const PANE_RENDER = "paneRender";

const LOGARITHMIC = "log";
const CATEGORY = "category";

const INSIDE_END = "insideEnd";
const INSIDE_BASE = "insideBase";
const OUTSIDE_END = "outsideEnd";

const MOUSEWHEEL = "DOMMouseScroll mousewheel";
const MOUSEWHEEL_DELAY = 150;

export {
    INITIAL_ANIMATION_DURATION, FADEIN,
    LEGEND_ITEM_CLICK, LEGEND_ITEM_HOVER, LEGEND_ITEM_LEAVE,
    SERIES_CLICK, SERIES_HOVER, SERIES_OVER, SERIES_LEAVE, GLASS,
    BORDER_BRIGHTNESS, TOOLTIP_OFFSET,
    START_SCALE, ERROR_LOW_FIELD, ERROR_HIGH_FIELD,
    X_ERROR_LOW_FIELD, X_ERROR_HIGH_FIELD,
    Y_ERROR_LOW_FIELD, Y_ERROR_HIGH_FIELD,
    LINE_MARKER_SIZE, INTERPOLATE, ZERO,
    SMOOTH, STEP, CATEGORY, FUNNEL,
    BAR, CANDLESTICK, PIE, COLUMN, AREA,
    VERTICAL_BULLET, BOX_PLOT, OHLC, WATERFALL, LINE,
    BULLET, VERTICAL_LINE, VERTICAL_AREA, RANGE_AREA, VERTICAL_RANGE_AREA,
    RANGE_COLUMN, VERTICAL_BOX_PLOT, RANGE_BAR, HORIZONTAL_WATERFALL,
    SCATTER, SCATTER_LINE, BUBBLE, RADAR_AREA, RADAR_LINE,
    RADAR_COLUMN, POLAR_LINE, POLAR_AREA, POLAR_SCATTER,
    RENDER, PLOT_AREA_CLICK, PLOT_AREA_HOVER, PLOT_AREA_LEAVE,
    LOGARITHMIC, DRAG, DRAG_START, DRAG_END, ZOOM_START, ZOOM, ZOOM_END,
    SELECT_START, SELECT, SELECT_END, PANE_RENDER, GAP,
    DONUT, INSIDE_END, INSIDE_BASE, OUTSIDE_END,
    MOUSEWHEEL, MOUSEWHEEL_DELAY, SHOW_TOOLTIP, HIDE_TOOLTIP,
    EQUALLY_SPACED_SERIES, ABOVE, BELOW
};
