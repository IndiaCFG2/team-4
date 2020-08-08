import createTransform from '../geometry/transform';

export default function translateToPoint(point, bbox, element) {
    const transofrm = element.transform() || createTransform();
    const matrix = transofrm.matrix();
    matrix.e += point.x - bbox.origin.x;
    matrix.f += point.y - bbox.origin.y;

    transofrm.matrix(matrix);
    element.transform(transofrm);
}