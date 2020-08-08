import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import BoxElement from './box-element';

import { CIRCLE, TRIANGLE, CROSS, CENTER, COORD_PRECISION } from '../common/constants';
import { round, setDefaultOptions } from '../common';

var ShapeElement = (function (BoxElement) {
    function ShapeElement(options, pointData) {
        BoxElement.call(this, options);

        this.pointData = pointData;
    }

    if ( BoxElement ) ShapeElement.__proto__ = BoxElement;
    ShapeElement.prototype = Object.create( BoxElement && BoxElement.prototype );
    ShapeElement.prototype.constructor = ShapeElement;

    ShapeElement.prototype.getElement = function getElement () {
        var ref = this;
        var options = ref.options;
        var box = ref.paddingBox;
        var type = options.type;
        var rotation = options.rotation;
        var center = box.center();
        var halfWidth = box.width() / 2;

        if (!options.visible || !this.hasBox()) {
            return null;
        }

        var style = this.visualStyle();
        var element;

        if (type === CIRCLE) {
            element = new draw.Circle(
                new geom.Circle([
                    round(box.x1 + halfWidth, COORD_PRECISION),
                    round(box.y1 + box.height() / 2, COORD_PRECISION)
                ], halfWidth),
                style
            );
        } else if (type === TRIANGLE) {
            element = draw.Path.fromPoints([
                [ box.x1 + halfWidth, box.y1 ],
                [ box.x1, box.y2 ],
                [ box.x2, box.y2 ]
            ], style).close();
        } else if (type === CROSS) {
            element = new draw.MultiPath(style);

            element.moveTo(box.x1, box.y1).lineTo(box.x2, box.y2);
            element.moveTo(box.x1, box.y2).lineTo(box.x2, box.y1);
        } else {
            element = draw.Path.fromRect(box.toRect(), style);
        }

        if (rotation) {
            element.transform(geom.transform()
                .rotate(-rotation, [ center.x, center.y ])
            );
        }

        element.options.zIndex = options.zIndex;
        return element;
    };

    ShapeElement.prototype.createElement = function createElement () {
        var this$1 = this;

        var customVisual = this.options.visual;
        var pointData = this.pointData || {};
        var visual;

        if (customVisual) {
            visual = customVisual({
                value: pointData.value,
                dataItem: pointData.dataItem,
                sender: this.getSender(),
                series: pointData.series,
                category: pointData.category,
                rect: this.paddingBox.toRect(),
                options: this.visualOptions(),
                createVisual: function () { return this$1.getElement(); }
            });
        } else {
            visual = this.getElement();
        }

        return visual;
    };

    ShapeElement.prototype.visualOptions = function visualOptions () {
        var options = this.options;
        return {
            background: options.background,
            border: options.border,
            margin: options.margin,
            padding: options.padding,
            type: options.type,
            size: options.width,
            visible: options.visible
        };
    };

    ShapeElement.prototype.createVisual = function createVisual () {
        this.visual = this.createElement();
    };

    return ShapeElement;
}(BoxElement));

setDefaultOptions(ShapeElement, {
    type: CIRCLE,
    align: CENTER,
    vAlign: CENTER
});

export default ShapeElement;