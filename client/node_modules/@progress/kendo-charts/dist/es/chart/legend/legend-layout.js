import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Box, rectToBox } from '../../core';

var LegendLayout = (function (ChartElement) {
    function LegendLayout(options, chartService) {
        ChartElement.call(this, options);

        this.chartService = chartService;
    }

    if ( ChartElement ) LegendLayout.__proto__ = ChartElement;
    LegendLayout.prototype = Object.create( ChartElement && ChartElement.prototype );
    LegendLayout.prototype.constructor = LegendLayout;

    LegendLayout.prototype.render = function render () {
        var ref = this;
        var children = ref.children;
        var options = ref.options;
        var vertical = options.vertical;

        this.visual = new draw.Layout(null, {
            spacing: vertical ? 0 : options.spacing,
            lineSpacing: vertical ? options.spacing : 0,
            orientation: vertical ? "vertical" : "horizontal",
            reverse: options.rtl,
            alignItems: vertical ? "start" : "center"
        });

        for (var idx = 0; idx < children.length; idx++) {
            var legendItem = children[idx];
            legendItem.reflow(new Box());
            legendItem.renderVisual();
        }
    };

    LegendLayout.prototype.reflow = function reflow (box) {
        this.visual.rect(box.toRect());
        this.visual.reflow();
        var bbox = this.visual.clippedBBox();

        if (bbox) {
            this.box = rectToBox(bbox);
        } else {
            this.box = new Box();
        }
    };

    LegendLayout.prototype.renderVisual = function renderVisual () {
        this.addVisual();
    };

    LegendLayout.prototype.createVisual = function createVisual () {};

    return LegendLayout;
}(ChartElement));

export default LegendLayout;