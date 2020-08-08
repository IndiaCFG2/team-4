import ErrorBarBase from './error-bar-base';

class CategoricalErrorBar extends ErrorBarBase {
    getAxis() {
        const axis = this.chart.seriesValueAxis(this.series);

        return axis;
    }
}

export default CategoricalErrorBar;