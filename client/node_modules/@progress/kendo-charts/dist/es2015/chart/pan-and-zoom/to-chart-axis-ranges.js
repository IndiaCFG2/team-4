export default function toChartAxisRanges(axisRanges) {
    const ranges = {};
    for (let idx = 0; idx < axisRanges.length; idx++) {
        const axisRange = axisRanges[idx];
        if (axisRange.axis.options.name) {
            ranges[axisRange.axis.options.name] = {
                min: axisRange.range.min,
                max: axisRange.range.max
            };
        }
    }
    return ranges;
}