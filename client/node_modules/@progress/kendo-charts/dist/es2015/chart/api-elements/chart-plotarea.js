import { Class } from '../../common';

class ChartPlotArea extends Class {
    constructor(plotArea) {
        super();

        this._plotArea = plotArea;
        this.visual = plotArea.visual;
        this.backgroundVisual = plotArea._bgVisual;
    }
}

export default ChartPlotArea;