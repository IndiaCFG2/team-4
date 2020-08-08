import { support } from '@progress/kendo-drawing';

var browser = support.browser || {};

var INITIAL_ANIMATION_DURATION = 600;
var FADEIN = "fadeIn";

var GLASS = "glass";
var BORDER_BRIGHTNESS = 0.8;
var TOOLTIP_OFFSET = 5;
var START_SCALE = browser.msie ? 0.001 : 0;
var ERROR_LOW_FIELD = "errorLow";
var ERROR_HIGH_FIELD = "errorHigh";
var X_ERROR_LOW_FIELD = "xErrorLow";
var X_ERROR_HIGH_FIELD = "xErrorHigh";
var Y_ERROR_LOW_FIELD = "yErrorLow";
var Y_ERROR_HIGH_FIELD = "yErrorHigh";
var LINE_MARKER_SIZE = 8;
var ZERO = "zero";
var INTERPOLATE = "interpolate";
var GAP = "gap";
var ABOVE = "above";
var BELOW = "below";

var SMOOTH = "smooth";
var STEP = "step";

var AREA = "area";
var BAR = "bar";
var BOX_PLOT = "boxPlot";
var BUBBLE = "bubble";
var BULLET = "bullet";
var CANDLESTICK = "candlestick";
var COLUMN = "column";
var DONUT = "donut";
var FUNNEL = "funnel";
var HORIZONTAL_WATERFALL = "horizontalWaterfall";
var LINE = "line";
var OHLC = "ohlc";
var PIE = "pie";
var POLAR_AREA = "polarArea";
var POLAR_LINE = "polarLine";
var POLAR_SCATTER = "polarScatter";
var RADAR_AREA = "radarArea";
var RADAR_COLUMN = "radarColumn";
var RADAR_LINE = "radarLine";
var RANGE_AREA = "rangeArea";
var RANGE_BAR = "rangeBar";
var RANGE_COLUMN = "rangeColumn";
var SCATTER = "scatter";
var SCATTER_LINE = "scatterLine";
var VERTICAL_AREA = "verticalArea";
var VERTICAL_BOX_PLOT = "verticalBoxPlot";
var VERTICAL_BULLET = "verticalBullet";
var VERTICAL_LINE = "verticalLine";
var VERTICAL_RANGE_AREA = "verticalRangeArea";
var WATERFALL = "waterfall";
var EQUALLY_SPACED_SERIES = [
    BAR, COLUMN, OHLC, CANDLESTICK, BOX_PLOT, VERTICAL_BOX_PLOT,
    BULLET, RANGE_COLUMN, RANGE_BAR, WATERFALL, HORIZONTAL_WATERFALL
];

var LEGEND_ITEM_CLICK = "legendItemClick";
var LEGEND_ITEM_HOVER = "legendItemHover";
var LEGEND_ITEM_LEAVE = "legendItemLeave";
var SERIES_CLICK = "seriesClick";
var SERIES_HOVER = "seriesHover";
var SERIES_OVER = "seriesOver";
var SERIES_LEAVE = "seriesLeave";
var PLOT_AREA_CLICK = "plotAreaClick";
var PLOT_AREA_HOVER = "plotAreaHover";
var PLOT_AREA_LEAVE = "plotAreaLeave";
var DRAG = "drag";
var DRAG_END = "dragEnd";
var DRAG_START = "dragStart";
var ZOOM_START = "zoomStart";
var ZOOM = "zoom";
var ZOOM_END = "zoomEnd";
var SELECT_START = "selectStart";
var SELECT = "select";
var SELECT_END = "selectEnd";
var RENDER = "render";
var SHOW_TOOLTIP = "showTooltip";
var HIDE_TOOLTIP = "hideTooltip";
var PANE_RENDER = "paneRender";

var LOGARITHMIC = "log";
var CATEGORY = "category";

var INSIDE_END = "insideEnd";
var INSIDE_BASE = "insideBase";
var OUTSIDE_END = "outsideEnd";

var MOUSEWHEEL = "DOMMouseScroll mousewheel";
var MOUSEWHEEL_DELAY = 150;

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
