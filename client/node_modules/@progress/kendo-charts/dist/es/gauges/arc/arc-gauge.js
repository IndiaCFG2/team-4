import RadialGauge from '../radial/radial-gauge';
import ArcScale from './arc-scale';
import RangePointer from './range-pointer';

import { deepExtend } from '../../common';


var ArcGauge = (function (RadialGauge) {
    function ArcGauge () {
        RadialGauge.apply(this, arguments);
    }

    if ( RadialGauge ) ArcGauge.__proto__ = RadialGauge;
    ArcGauge.prototype = Object.create( RadialGauge && RadialGauge.prototype );
    ArcGauge.prototype.constructor = ArcGauge;

    ArcGauge.prototype._initTheme = function _initTheme (theme) {
        RadialGauge.prototype._initTheme.call(this, theme);

        this.options.color = this.options.color || (this.theme.pointer || {}).color;
    };

    ArcGauge.prototype._createModel = function _createModel () {
        var options = this.options;
        var scale = this.scale = new ArcScale(options.scale, this.contextService);

        var pointer = new RangePointer(scale, deepExtend({}, {
            colors: options.colors,
            color: options.color,
            value: options.value,
            opacity: options.opacity,
            animation: {
                transitions: options.transitions
            }
        }));

        this.pointers = [ pointer ];
    };

    ArcGauge.prototype._buildPointers = function _buildPointers (pointers) {
        for (var i = 0; i < pointers.length; i++) {
            var current = pointers[i];
            current.render();

            current.value(current.options.value);
        }
    };

    ArcGauge.prototype._setValueOptions = function _setValueOptions (value) {
        this.options.value = value;
    };

    ArcGauge.prototype.currentColor = function currentColor () {
        var pointer = this.pointers[0];
        if (pointer) {
            return pointer.currentColor();
        }
    };

    ArcGauge.prototype.centerLabelPosition = function centerLabelPosition (width, height) {
        var size = this.getSize();
        var center = this.scale.arc.center;

        var left = center.x - width / 2;
        var top = center.y - height / 2;

        if (width < size.width) {
            var right = left + width;

            left = Math.max(left, 0);

            if (right > size.width) {
                left -= right - size.width;
            }
        }

        if (height < size.height) {
            var bbox = this.scale.bbox;
            var yLimit = bbox.bottomRight().y;
            var bottom = top + height;

            top = Math.max(top, bbox.origin.y);

            if (bottom > yLimit) {
                top -= bottom - yLimit;
            }
        }

        return {
            left: left,
            top: top
        };
    };

    return ArcGauge;
}(RadialGauge));

export default ArcGauge;