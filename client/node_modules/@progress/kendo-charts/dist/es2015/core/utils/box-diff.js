import Box from '../box';
import { grep } from '../../common';

export default function boxDiff(r, s) {
    if (r.x1 === s.x1 && r.y1 === s.y1 && r.x2 === s.x2 && r.y2 === s.y2) {
        return s;
    }

    const a = Math.min(r.x1, s.x1);
    const b = Math.max(r.x1, s.x1);
    const c = Math.min(r.x2, s.x2);
    const d = Math.max(r.x2, s.x2);
    const e = Math.min(r.y1, s.y1);
    const f = Math.max(r.y1, s.y1);
    const g = Math.min(r.y2, s.y2);
    const h = Math.max(r.y2, s.y2);
    const boxes = [];

    // X = intersection, 0-7 = possible difference areas
    // h +-+-+-+
    // . |5|6|7|
    // g +-+-+-+
    // . |3|X|4|
    // f +-+-+-+
    // . |0|1|2|
    // e +-+-+-+
    // . a b c d

    // we'll always have rectangles 1, 3, 4 and 6
    boxes[0] = new Box(b, e, c, f);
    boxes[1] = new Box(a, f, b, g);
    boxes[2] = new Box(c, f, d, g);
    boxes[3] = new Box(b, g, c, h);

    // decide which corners
    if (r.x1 === a && r.y1 === e || s.x1 === a && s.y1 === e) { // corners 0 and 7
        boxes[4] = new Box(a, e, b, f);
        boxes[5] = new Box(c, g, d, h);
    } else { // corners 2 and 5
        boxes[4] = new Box(c, e, d, f);
        boxes[5] = new Box(a, g, b, h);
    }

    return grep(boxes, function(box) {
        return box.height() > 0 && box.width() > 0;
    })[0];
}