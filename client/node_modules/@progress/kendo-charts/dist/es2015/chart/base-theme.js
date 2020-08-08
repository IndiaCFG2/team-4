const BAR_GAP = 1.5;
const BAR_SPACING = 0.4;
const BLACK = '#000';
const SANS = 'Arial, Helvetica, sans-serif';
const SANS11 = "11px " + SANS;
const SANS12 = '12px ' + SANS;
const SANS16 = '16px ' + SANS;
const TRANSPARENT = 'transparent';
const WHITE = '#fff';

const notes = () => ({
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
});

const axisDefaults = () => ({
    labels: {
        font: SANS12
    },
    notes: notes(),
    title: {
        font: SANS16,
        margin: 5
    }
});

const areaSeries = () => ({
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
});

const rangeAreaSeries = () => ({
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
});

const barSeries = () => ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
});

const boxPlotSeries = () => ({
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
});

const bubbleSeries = () => ({
    border: {
        width: 0
    },
    labels: {
        background: TRANSPARENT
    },
    opacity: 0.6
});

const bulletSeries = () => ({
    gap: BAR_GAP,
    spacing: BAR_SPACING,
    target: {
        color: "#ff0000"
    }
});

const candlestickSeries = () => ({
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
});

const columnSeries = () => ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
});

const donutSeries = () => ({
    margin: 1
});

const lineSeries = () => ({
    width: 2
});

const ohlcSeries = () => ({
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
});

const radarAreaSeries = () => ({
    line: {
        opacity: 1,
        width: 0
    },
    markers: {
        size: 6,
        visible: false
    },
    opacity: 0.5
});

const radarLineSeries = () => ({
    markers: {
        visible: false
    },
    width: 2
});

const rangeBarSeries = () => ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
});

const rangeColumnSeries = () => ({
    gap: BAR_GAP,
    spacing: BAR_SPACING
});

const scatterLineSeries = () => ({
    width: 1
});

const waterfallSeries = () => ({
    gap: 0.5,
    line: {
        color: BLACK,
        width: 1
    },
    spacing: BAR_SPACING
});

const pieSeries = () => ({
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
});

const funnelSeries = () => ({
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
});

const seriesDefaults = (options) => ({
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
});

const title = () => ({
    font: SANS16
});

const legend = () => ({
    labels: {
        font: SANS12
    }
});

export const baseTheme = (options = {}) => ({
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

