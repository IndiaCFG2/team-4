import { getSpacing } from '../../common';

export default function pad(bbox, value) {
    var origin = bbox.getOrigin();
    var size = bbox.getSize();
    var spacing = getSpacing(value);

    bbox.setOrigin([ origin.x - spacing.left, origin.y - spacing.top ]);
    bbox.setSize([ size.width + (spacing.left + spacing.right), size.height + (spacing.top + spacing.bottom) ]);

    return bbox;
}