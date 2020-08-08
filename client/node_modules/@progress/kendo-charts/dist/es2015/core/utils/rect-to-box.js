import Box from '../box';

export default function rectToBox(rect) {
    const origin = rect.origin;
    const bottomRight = rect.bottomRight();

    return new Box(origin.x, origin.y, bottomRight.x, bottomRight.y);
}