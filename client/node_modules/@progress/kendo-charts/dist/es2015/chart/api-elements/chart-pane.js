import findAxisByName from './find-axis-by-name';

class ChartPane {
    constructor(pane) {
        this.visual = pane.visual;
        this.chartsVisual = pane.chartContainer.visual;
        this._pane = pane;
    }

    findAxisByName(name) {
        return findAxisByName(name, this._pane.axes);
    }
}

export default ChartPane;