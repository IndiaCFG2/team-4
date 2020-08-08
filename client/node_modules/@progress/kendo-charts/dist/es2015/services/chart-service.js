import IntlService from './intl-service';
import FormatService from './format-service';

class ChartService {
    constructor(chart, context = {}) {
        this._intlService = context.intlService;
        this.sender = context.sender || chart;
        this.format = new FormatService(context.intlService);
        this.chart = chart;
        this.rtl = Boolean(context.rtl);
    }

    get intl() {
        return this._intlService || IntlService.implementation;
    }

    set intl(value) {
        this._intlService = value;
        this.format.intl = value;
    }

    notify(name, args) {
        if (this.chart) {
            this.chart.trigger(name, args);
        }
    }

    isPannable(axis) {
        const pannable = ((this.chart || {}).options || {}).pannable;
        return pannable && pannable.lock !== axis;
    }
}

export default ChartService;