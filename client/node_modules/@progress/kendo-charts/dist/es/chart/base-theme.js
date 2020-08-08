var BAR_GAP = 1.5;
var BAR_SPACING = 0.4;
var BLACK = '#000';
var SANS = 'Arial, Helvetica, sans-serif';
var SANS11 = "11px " + SANS;
var SANS12 = '12px ' + SANS;
var SANS16 = '16px ' + SANS;
var TRANSPARENT = 'transparent';
var WHITE = '#fff';

var notes = function () { return ({
    icon: {
        border: {
            width: 1
        }
    },
    label: {
        font: SANS12,
        padding: 3
    },
    line: {
        length: 10,
        width: 2
    },
    visible: true
}); };

var axisDefaults = function () { return ({
    labels: {
        font: SANS12
    },
    notes: notes(),
    title: {
        font: SANS16,
        margin: 5
    }
}); };

var areaSeries = function () { return ({
    highlight: {
        markers: {
            border: {}
        }
    },
    line: {
        opacity: 1,
        width: 0
    },
    markers: {
        size: 6,
        visible: false
    },
    opacity: 0.4
}); };

var rangeAreaSeries = function () { return ({
    highlight: {
        markers: {
            border: {}
        }
    },
    line: {
        opacity: 1,
        width: 0
    },
    markers: {
        size: 6,
        visible: false
    },
    opacity: 0.4
}); };

var barSeries = function () { return ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
}); };

var boxPlotSeries = function () { return ({
    outliersField: "",
    meanField: "",
    border: {
        _brightness: 0.8,
        width: 1
    },
    downColor: WHITE,
    gap: 1,
    highlight: {
        border: {
            opacity: 1,
            width: 2
        },
        whiskers: {
            width: 3
        },
        mean: {
            width: 2
        },
        median: {
            width: 2
        }
    },
    mean: {
        width: 2
    },
    median: {
        width: 2
    },
    spacing: 0.3,
    whiskers: {
        width: 2
    }
}); };

var bubbleSeries = function () { return ({
    border: {
        width: 0
    },
    labels: {
        background: TRANSPARENT
    },
    opacity: 0.6
}); };

var bulletSeries = function () { return ({
    gap: BAR_GAP,
    spacing: BAR_SPACING,
    target: {
        color: "#ff0000"
    }
}); };

var candlestickSeries = function () { return ({
    border: {
        _brightness: 0.8,
        width: 1
    },
    downColor: WHITE,
    gap: 1,
    highlight: {
        border: {
            opacity: 1,
            width: 2
        },
        line: {
            width: 2
        }
    },
    line: {
        color: BLACK,
        width: 1
    },
    spacing: 0.3
}); };

var columnSeries = function () { return ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
}); };

var donutSeries = function () { return ({
    margin: 1
}); };

var lineSeries = function () { return ({
    width: 2
}); };

var ohlcSeries = function () { return ({
    gap: 1,
    highlight: {
        line: {
            opacity: 1,
            width: 3
        }
    },
    line: {
        width: 1
    },
    spacing: 0.3
}); };

var radarAreaSeries = function () { return ({
    line: {
        opacity: 1,
        width: 0
    },
    markers: {
        size: 6,
        visible: false
    },
    opacity: 0.5
}); };

var radarLineSeries = function () { return ({
    markers: {
        visible: false
    },
    width: 2
}); };

var rangeBarSeries = function () { return ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
}); };

var rangeColumnSeries = function () { return ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
}); };

var scatterLineSeries = function () { return ({
    width: 1
}); };

var waterfallSeries = function () { return ({
    gap: 0.5,
    line: {
        color: BLACK,
        width: 1
    },
    spacing: BAR_SPACING
}); };

var pieSeries = function () { return ({
    labels: {
        background: '',
        color: '',
        padding: {
            top: 5,
            bottom: 5,
            left: 7,
            right: 7
        }
    }
}); };

var funnelSeries = function () { return ({
    labels: {
        background: '',
        color: '',
        padding: {
            top: 5,
            bottom: 5,
            left: 7,
            right: 7
        }
    }
}); };

var seriesDefaults = function (options) { return ({
    visible: true,
    labels: {
        font: SANS11
    },
    overlay: options.gradients ? {} : {
        gradient: "none"
    },
    area: areaSeries(),
    rangeArea: rangeAreaSeries(),
    verticalRangeArea: rangeAreaSeries(),
    bar: barSeries(),
    boxPlot: boxPlotSeries(),
    bubble: bubbleSeries(),
    bullet: bulletSeries(),
    candlestick: candlestickSeries(),
    column: columnSeries(),
    pie: pieSeries(),
    donut: donutSeries(),
    funnel: funnelSeries(),
    horizontalWaterfall: waterfallSeries(),
    line: lineSeries(),
    notes: notes(),
    ohlc: ohlcSeries(),
    radarArea: radarAreaSeries(),
    radarLine: radarLineSeries(),
    polarArea: radarAreaSeries(),
    polarLine: radarLineSeries(),
    rangeBar: rangeBarSeries(),
    rangeColumn: rangeColumnSeries(),
    scatterLine: scatterLineSeries(),
    verticalArea: areaSeries(),
    verticalBoxPlot: boxPlotSeries(),
    verticalBullet: bulletSeries(),
    verticalLine: lineSeries(),
    waterfall: waterfallSeries()
}); };

var title = function () { return ({
    font: SANS16
}); };

var legend = function () { return ({
    labels: {
        font: SANS12
    }
}); };

export var baseTheme = function (options) {
    if ( options === void 0 ) options = {};

    return ({
    axisDefaults: axisDefaults(),
    categoryAxis: {
        majorGridLines: {
            visible: true
        }
    },
    navigator: {
        pane: {
            height: 90,
            margin: {
                top: 10
            }
        }
    },
    seriesDefaults: seriesDefaults(options),
    title: title(),
    legend: legend()
});
};

