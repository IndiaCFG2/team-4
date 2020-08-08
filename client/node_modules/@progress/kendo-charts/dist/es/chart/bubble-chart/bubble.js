import { drawing as draw, geometry as geom, Color } from '@progress/kendo-drawing';

import LinePoint from '../line-chart/line-point';
import { BORDER_BRIGHTNESS } from '../constants';

import { CENTER } from '../../common/constants';
import { deepExtend } from '../../common';

var Bubble = (function (LinePoint) {
    function Bubble(value, options) {
        LinePoint.call(this, value, options);

        this.category = value.category;
    }

    if ( LinePoint ) Bubble.__proto__ = LinePoint;
    Bubble.prototype = Object.create( LinePoint && LinePoint.prototype );
    Bubble.prototype.constructor = Bubble;

    Bubble.prototype.createHighlight = function createHighlight () {
        var highlight = this.options.highlight;
        var border = highlight.border;
        var markers = this.options.markers;
        var center = this.box.center();
        var radius = (markers.size + markers.border.width + border.width) / 2;
        var highlightGroup = new draw.Group();
        var shadow = new draw.Circle(new geom.Circle([ center.x, center.y + radius / 5 + border.width / 2 ], radius + border.width / 2), {
            stroke: {
                color: 'none'
            },
            fill: this.createGradient({
                gradient: 'bubbleShadow',
                color: markers.background,
                stops: [ {
                    offset: 0,
                    color: markers.background,
                    opacity: 0.3
                }, {
                    offset: 1,
                    color: markers.background,
                    opacity: 0
                } ]
            })
        });
        var overlay = new draw.Circle(new geom.Circle([ center.x, center.y ], radius), {
            stroke: {
                color: border.color ||
                    new Color(markers.background).brightness(BORDER_BRIGHTNESS).toHex(),
                width: border.width,
                opacity: border.opacity
            },
            fill: {
                color: markers.background,
                opacity: highlight.opacity
            }
        });

        highlightGroup.append(shadow, overlay);

        return highlightGroup;
    };

    return Bubble;
}(LinePoint));

Bubble.prototype.defaults = deepExtend({}, Bubble.prototype.defaults, {
    labels: {
        position: CENTER
    },
    highlight: {
        opacity: 1,
        border: {
            color: "#fff",
            width: 2,
            opacity: 1
        }
    }
});

Bubble.prototype.defaults.highlight.zIndex = undefined;

export default Bubble;