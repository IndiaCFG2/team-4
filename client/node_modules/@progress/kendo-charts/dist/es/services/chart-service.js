import IntlService from './intl-service';
import FormatService from './format-service';

var ChartService = function ChartService(chart, context) {
    if ( context === void 0 ) context = {};

    this._intlService = context.intlService;
    this.sender = context.sender || chart;
    this.format = new FormatService(context.intlService);
    this.chart = chart;
    this.rtl = Boolean(context.rtl);
};

var prototypeAccessors = { intl: { configurable: true } };

prototypeAccessors.intl.get = function () {
    return this._intlService || IntlService.implementation;
};

prototypeAccessors.intl.set = function (value) {
    this._intlService = value;
    this.format.intl = value;
};

ChartService.prototype.notify = function notify (name, args) {
    if (this.chart) {
        this.chart.trigger(name, args);
    }
};

ChartService.prototype.isPannable = function isPannable (axis) {
    var pannable = ((this.chart || {}).options || {}).pannable;
    return pannable && pannable.lock !== axis;
};

Object.defineProperties( ChartService.prototype, prototypeAccessors );

export default ChartService;