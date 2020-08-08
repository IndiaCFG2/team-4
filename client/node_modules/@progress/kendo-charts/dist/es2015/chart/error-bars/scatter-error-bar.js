import ErrorBarBase from './error-bar-base';

class ScatterErrorBar extends ErrorBarBase {
    getAxis() {
        const axes = this.chart.seriesAxes(this.series);
        const axis = this.isVertical ? axes.y : axes.x;

        return axis;
    }
}

export default ScatterErrorBar;