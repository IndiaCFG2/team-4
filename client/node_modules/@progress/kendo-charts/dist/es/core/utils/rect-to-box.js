import Box from '../box';

export default function rectToBox(rect) {
    var origin = rect.origin;
    var bottomRight = rect.bottomRight();

    return new Box(origin.x, origin.y, bottomRight.x, bottomRight.y);
}