import Rect from '../../geometry/rect';

export default function elementsClippedBoundingBox(elements, transformation) {
    let boundingBox;

    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        if (element.visible()) {
            let elementBoundingBox = element.clippedBBox(transformation);
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