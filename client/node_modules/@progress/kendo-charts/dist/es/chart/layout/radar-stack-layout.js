import { ChartElement, Box } from '../../core';

var RadarStackLayout = (function (ChartElement) {
    function RadarStackLayout () {
        ChartElement.apply(this, arguments);
    }

    if ( ChartElement ) RadarStackLayout.__proto__ = ChartElement;
    RadarStackLayout.prototype = Object.create( ChartElement && ChartElement.prototype );
    RadarStackLayout.prototype.constructor = RadarStackLayout;

    RadarStackLayout.prototype.reflow = function reflow (sector) {
        var ref = this;
        var reverse = ref.options.reverse;
        var children = ref.children;
        var childrenCount = children.length;
        var first = reverse ? childrenCount - 1 : 0;
        var step = reverse ? -1 : 1;

        this.box = new Box();

        for (var i = first; i >= 0 && i < childrenCount; i += step) {
            var childSector = children[i].sector;
            childSector.startAngle = sector.startAngle;
            childSector.angle = sector.angle;
        }
    };

    return RadarStackLayout;
}(ChartElement));

export default RadarStackLayout;