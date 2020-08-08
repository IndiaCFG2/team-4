export default function toChartAxisRanges(axisRanges) {
    var ranges = {};
    for (var idx = 0; idx < axisRanges.length; idx++) {
        var axisRange = axisRanges[idx];
        if (axisRange.axis.options.name) {
            ranges[axisRange.axis.options.name] = {
                min: axisRange.range.min,
                max: axisRange.range.max
            };
        }
    }
    return ranges;
}