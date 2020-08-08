import { getTemplate } from '../../common';
import { hasValue } from '../utils';

const PieChartMixin = {
    createLegendItem: function(value, point, options) {
        const legendOptions = this.options.legend || {};
        const labelsOptions = legendOptions.labels || {};
        const inactiveItems = legendOptions.inactiveItems || {};
        const inactiveItemsLabels = inactiveItems.labels || {};

        if (options && options.visibleInLegend !== false) {
            const pointVisible = options.visible !== false;
            const labelTemplate = pointVisible ? getTemplate(labelsOptions) :
                getTemplate(inactiveItemsLabels) || getTemplate(labelsOptions);
            let text = options.category;

            if (labelTemplate) {
                text = labelTemplate({
                    text: text,
                    series: options.series,
                    dataItem: options.dataItem,
                    percentage: options.percentage,
                    value: value
                });
            }

            let itemLabelOptions, markerColor;
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