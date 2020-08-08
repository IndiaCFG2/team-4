import { drawing as draw, geometry as geom } from '@progress/kendo-drawing';

import BoxElement from './box-element';

import { CIRCLE, TRIANGLE, CROSS, CENTER, COORD_PRECISION } from '../common/constants';
import { round, setDefaultOptions } from '../common';

class ShapeElement extends BoxElement {

    constructor(options, pointData) {
        super(options);

        this.pointData = pointData;
    }

    getElement() {
        const { options, paddingBox: box } = this;
        const { type, rotation } = options;
        const center = box.center();
        const halfWidth = box.width() / 2;

        if (!options.visible || !this.hasBox()) {
            return null;
        }

        const style = this.visualStyle();
        let element;

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
    }

    createElement() {
        const customVisual = this.options.visual;
        const pointData = this.pointData || {};
        let visual;

        if (customVisual) {
            visual = customVisual({
                value: pointData.value,
                dataItem: pointData.dataItem,
                sender: this.getSender(),
                series: pointData.series,
                category: pointData.category,
                rect: this.paddingBox.toRect(),
                options: this.visualOptions(),
                createVisual: () => this.getElement()
            });
        } else {
            visual = this.getElement();
        }

        return visual;
    }

    visualOptions() {
        const options = this.options;
        return {
            background: options.background,
            border: options.border,
            margin: options.margin,
            padding: options.padding,
            type: options.type,
            size: options.width,
            visible: options.visible
        };
    }

    createVisual() {
        this.visual = this.createElement();
    }
}

setDefaultOptions(ShapeElement, {
    type: CIRCLE,
    align: CENTER,
    vAlign: CENTER
});

export default ShapeElement;