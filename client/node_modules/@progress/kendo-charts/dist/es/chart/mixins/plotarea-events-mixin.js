import { PLOT_AREA_HOVER, PLOT_AREA_CLICK } from '../constants';

var PlotAreaEventsMixin = {
    hover: function(chart, e) {
        this._dispatchEvent(chart, e, PLOT_AREA_HOVER);
    },

    click: function(chart, e) {
        this._dispatchEvent(chart, e, PLOT_AREA_CLICK);
    }
};

export default PlotAreaEventsMixin;