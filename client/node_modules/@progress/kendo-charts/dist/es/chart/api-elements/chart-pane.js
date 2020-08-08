import findAxisByName from './find-axis-by-name';

var ChartPane = function ChartPane(pane) {
    this.visual = pane.visual;
    this.chartsVisual = pane.chartContainer.visual;
    this._pane = pane;
};

ChartPane.prototype.findAxisByName = function findAxisByName$1 (name) {
    return findAxisByName(name, this._pane.axes);
};

export default ChartPane;