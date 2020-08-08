import { drawing as draw } from '@progress/kendo-drawing';

import { alignPathToPixel } from '../../common';

export default function createAxisGridLine(options, gridLine) {
    const { lineStart, lineEnd, position } = options;

    const line = new draw.Path({
        stroke: {
            width: gridLine.width,
            color: gridLine.color,
            dashType: gridLine.dashType
        }
    });

    if (options.vertical) {
        line.moveTo(lineStart, position)
            .lineTo(lineEnd, position);
    } else {
        line.moveTo(position, lineStart)
            .lineTo(position, lineEnd);
    }

    alignPathToPixel(line);

    return line;
}