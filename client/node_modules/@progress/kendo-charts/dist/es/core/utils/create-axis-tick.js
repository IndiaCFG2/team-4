import { drawing as draw } from '@progress/kendo-drawing';

import { alignPathToPixel } from '../../common';

export default function createAxisTick(options, tickOptions) {
    var tickX = options.tickX;
    var tickY = options.tickY;
    var position = options.position;

    var tick = new draw.Path({
        stroke: {
            width: tickOptions.width,
            color: tickOptions.color
        }
    });

    if (options.vertical) {
        tick.moveTo(tickX, position)
            .lineTo(tickX + tickOptions.size, position);
    } else {
        tick.moveTo(position, tickY)
            .lineTo(position, tickY + tickOptions.size);
    }

    alignPathToPixel(tick);

    return tick;
}