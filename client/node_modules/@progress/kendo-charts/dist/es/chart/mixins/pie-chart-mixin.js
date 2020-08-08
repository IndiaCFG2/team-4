import { getTemplate } from '../../common';
import { hasValue } from '../utils';

var PieChartMixin = {
    createLegendItem: function(value, point, options) {
        var legendOptions = this.options.legend || {};
        var labelsOptions = legendOptions.labels || {};
        var inactiveItems = legendOptions.inactiveItems || {};
        var inactiveItemsLabels = inactiveItems.labels || {};

        if (options && options.visibleInLegend !== false) {
            var pointVisible = options.visible !== false;
            var labelTemplate = pointVisible ? getTemplate(labelsOptions) :
                getTemplate(inactiveItemsLabels) || getTemplate(labelsOptions);
            var text = options.category;

            if (labelTemplate) {
                text = labelTemplate({
                    text: text,
                    series: options.series,
                    dataItem: options.dataItem,
                    percentage: options.percentage,
                    value: value
                });
            }

            var itemLabelOptions, markerColor;
            if (pointVisible) {
                itemLabelOptions = {};
                markerColor = point.color;
            } else {
                itemLabelOptions = {
                    color: inactiveItemsLabels.color,
                    font: inactiveItemsLabels.font
                };
                markerColor = (inactiveItems.markers || {}).color;
            }

            if (hasValue(text) && text !== "") {
                this.legendItems.push({
                    active: pointVisible,
                    pointIndex: options.index,
                    text: text,
                    series: options.series,
                    markerColor: markerColor,
                    labels: itemLabelOptions
                });
            }
        }
    }
};

export default PieChartMixin;