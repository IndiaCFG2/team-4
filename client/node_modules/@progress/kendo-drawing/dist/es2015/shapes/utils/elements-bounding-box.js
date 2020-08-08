import Rect from '../../geometry/rect';

export default function elementsBoundingBox(elements, applyTransform, transformation) {
    let boundingBox;

    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (element.visible()) {
            let elementBoundingBox = applyTransform ? element.bbox(transformation) : element.rawBBox();
            if (elementBoundingBox) {
                if (boundingBox) {
                    boundingBox = Rect.union(boundingBox, elementBoundingBox);
                } else {
                    boundingBox = elementBoundingBox;
                }
            }
        }
    }

    return boundingBox;
}

