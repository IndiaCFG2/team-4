import translateToPoint from './translate-to-point';
import alignStart from './align-start';

export default function alignElements(elements, rect, alignment, axis, sizeField) {
    for (let idx = 0; idx < elements.length; idx++) {
        const bbox = elements[idx].clippedBBox();
        if (bbox) {
            const point = bbox.origin.clone();
            point[axis] = alignStart(bbox.size[sizeField], rect, alignment || "start", axis, sizeField);
            translateToPoint(point, bbox, elements[idx]);
        }
    }
}