import Point from '../geometry/point';
import translateToPoint from './translate-to-point';

export default function stackElements(elements, stackAxis, otherAxis, sizeField) {
    if (elements.length > 1) {
        const origin = new Point();
        let previousBBox = elements[0].bbox;

        for (let idx = 1; idx < elements.length; idx++) {
            let element = elements[idx].element;
            let bbox = elements[idx].bbox;
            origin[stackAxis] = previousBBox.origin[stackAxis] + previousBBox.size[sizeField];
            origin[otherAxis] = bbox.origin[otherAxis];
            translateToPoint(origin, bbox, element);
            bbox.origin[stackAxis] = origin[stackAxis];
            previousBBox = bbox;
        }
    }
}