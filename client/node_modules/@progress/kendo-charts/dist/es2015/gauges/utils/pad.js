import { getSpacing } from '../../common';

export default function pad(bbox, value) {
    const origin = bbox.getOrigin();
    const size = bbox.getSize();
    const spacing = getSpacing(value);

    bbox.setOrigin([ origin.x - spacing.left, origin.y - spacing.top ]);
    bbox.setSize([ size.width + (spacing.left + spacing.right), size.height + (spacing.top + spacing.bottom) ]);

    return bbox;
}