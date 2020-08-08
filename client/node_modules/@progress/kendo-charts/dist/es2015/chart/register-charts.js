import PlotAreaFactory from './plotarea/plotarea-factory';
import SeriesBinder from './series-binder';
import DefaultAggregates from './aggregates/default-aggregates';
import CategoricalPlotArea from './plotarea/categorical-plotarea';
import XYPlotArea from './plotarea/xy-plotarea';
import PiePlotArea from './plotarea/pie-plotarea';
import DonutPlotArea from './plotarea/donut-plotarea';
import PolarPlotArea from './plotarea/polar-plotarea';
import RadarPlotArea from './plotarea/radar-plotarea';
import FunnelPlotArea from './plotarea/funnel-plotarea';

import { COLUMN, DONUT, PIE, FUNNEL, BAR, LINE, VERTICAL_LINE, AREA, VERTICAL_AREA,
    CANDLESTICK, OHLC, BULLET, VERTICAL_BULLET, BOX_PLOT, VERTICAL_BOX_PLOT, RANGE_COLUMN,
    RANGE_BAR, WATERFALL, HORIZONTAL_WATERFALL, SCATTER, SCATTER_LINE, BUBBLE,
    POLAR_AREA, POLAR_LINE, POLAR_SCATTER, RADAR_AREA, RADAR_COLUMN, RADAR_LINE, CATEGORY,
    RANGE_AREA, VERTICAL_RANGE_AREA, X_ERROR_LOW_FIELD, X_ERROR_HIGH_FIELD, Y_ERROR_LOW_FIELD, Y_ERROR_HIGH_FIELD,
    ERROR_LOW_FIELD, ERROR_HIGH_FIELD } from './constants';
import { X, Y, VALUE } from '../common/constants';

const COLOR = "color";
const FIRST = "first";
const FROM = "from";
const MAX = "max";
const MIN = "min";
const NOTE_TEXT = "noteText";
const SUMMARY_FIELD = "summary";
const TO = "to";

PlotAreaFactory.current.register(CategoricalPlotArea, [
    BAR, COLUMN, LINE, VERTICAL_LINE, AREA, VERTICAL_AREA,
    CANDLESTICK, OHLC, BULLET, VERTICAL_BULLET, BOX_PLOT, VERTICAL_BOX_PLOT,
    RANGE_COLUMN, RANGE_BAR, WATERFALL, HORIZONTAL_WATERFALL, RANGE_AREA, VERTICAL_RANGE_AREA
]);

PlotAreaFactory.current.register(XYPlotArea, [
    SCATTER, SCATTER_LINE, BUBBLE
]);

PlotAreaFactory.current.register(PiePlotArea, [ PIE ]);
PlotAreaFactory.current.register(DonutPlotArea, [ DONUT ]);
PlotAreaFactory.current.register(FunnelPlotArea, [ FUNNEL ]);

PlotAreaFactory.current.register(PolarPlotArea, [ POLAR_AREA, POLAR_LINE, POLAR_SCATTER ]);
PlotAreaFactory.current.register(RadarPlotArea, [ RADAR_AREA, RADAR_COLUMN, RADAR_LINE ]);

SeriesBinder.current.register(
    [ BAR, COLUMN, LINE, VERTICAL_LINE, AREA, VERTICAL_AREA ],
    [ VALUE ], [ CATEGORY, COLOR, NOTE_TEXT, ERROR_LOW_FIELD, ERROR_HIGH_FIELD ]
);

SeriesBinder.current.register(
    [ RANGE_COLUMN, RANGE_BAR, RANGE_AREA, VERTICAL_RANGE_AREA ],
    [ FROM, TO ], [ CATEGORY, COLOR, NOTE_TEXT ]
);

SeriesBinder.current.register(
    [ WATERFALL, HORIZONTAL_WATERFALL ],
    [ VALUE ], [ CATEGORY, COLOR, NOTE_TEXT, SUMMARY_FIELD ]
);

SeriesBinder.current.register([ POLAR_AREA, POLAR_LINE, POLAR_SCATTER ], [ X, Y ], [ COLOR ]);
SeriesBinder.current.register([ RADAR_AREA, RADAR_COLUMN, RADAR_LINE ], [ VALUE ], [ COLOR ]);

SeriesBinder.current.register(
    [ FUNNEL ],
    [ VALUE ], [ CATEGORY, COLOR, "visibleInLegend", "visible" ]
);

DefaultAggregates.current.register(
    [ BAR, COLUMN, LINE, VERTICAL_LINE, AREA, VERTICAL_AREA, WATERFALL, HORIZONTAL_WATERFALL ],
    { value: MAX, color: FIRST, noteText: FIRST, errorLow: MIN, errorHigh: MAX }
);

DefaultAggregates.current.register(
    [ RANGE_COLUMN, RANGE_BAR, RANGE_AREA, VERTICAL_RANGE_AREA ],
    { from: MIN, to: MAX, color: FIRST, noteText: FIRST }
);

DefaultAggregates.current.register(
    [ RADAR_AREA, RADAR_COLUMN, RADAR_LINE ],
    { value: MAX, color: FIRST }
);

SeriesBinder.current.register(
    [ SCATTER, SCATTER_LINE, BUBBLE ],
    [ X, Y ], [ COLOR, NOTE_TEXT, X_ERROR_LOW_FIELD, X_ERROR_HIGH_FIELD, Y_ERROR_LOW_FIELD, Y_ERROR_HIGH_FIELD ]
);

SeriesBinder.current.register(
    [ BUBBLE ], [ X, Y, "size" ], [ COLOR, CATEGORY, NOTE_TEXT ]
);

SeriesBinder.current.register(
    [ CANDLESTICK, OHLC ],
    [ "open", "high", "low", "close" ], [ CATEGORY, COLOR, "downColor", NOTE_TEXT ]
);

DefaultAggregates.current.register(
    [ CANDLESTICK, OHLC ],
    { open: MAX, high: MAX, low: MIN, close: MAX,
      color: FIRST, downColor: FIRST, noteText: FIRST }
);

SeriesBinder.current.register(
    [ BOX_PLOT, VERTICAL_BOX_PLOT ],
    [ "lower", "q1", "median", "q3", "upper", "mean", "outliers" ], [ CATEGORY, COLOR, NOTE_TEXT ]
);

DefaultAggregates.current.register(
    [ BOX_PLOT, VERTICAL_BOX_PLOT ],
    { lower: MAX, q1: MAX, median: MAX, q3: MAX, upper: MAX, mean: MAX, outliers: FIRST,
      color: FIRST, noteText: FIRST }
);

SeriesBinder.current.register(
    [ BULLET, VERTICAL_BULLET ],
    [ "current", "target" ], [ CATEGORY, COLOR, "visibleInLegend", NOTE_TEXT ]
);

DefaultAggregates.current.register(
    [ BULLET, VERTICAL_BULLET ],
    { current: MAX, target: MAX, color: FIRST, noteText: FIRST }
);

SeriesBinder.current.register(
    [ PIE, DONUT ],
    [ VALUE ], [ CATEGORY, COLOR, "explode", "visibleInLegend", "visible" ]
);