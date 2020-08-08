import { drawing } from '@progress/kendo-drawing';

export default function mousewheelDelta(e) {
    var delta = 0;

    if (e.wheelDelta) {
        delta = -e.wheelDelta / 120;
        delta = delta > 0 ? Math.ceil(delta) : Math.floor(delta);
    }

    if (e.detail) {
        delta = drawing.util.round(e.detail / 3);
    }

    return delta;
}