import { deg } from '../../util';
import transform from '../transform';

export default function isOutOfEndPoint(endPoint, controlPoint, point) {
    const angle = deg(Math.atan2(controlPoint.y - endPoint.y, controlPoint.x - endPoint.x));
    const rotatedPoint = point.transformCopy(transform().rotate(-angle, endPoint));

    return rotatedPoint.x < endPoint.x;
}