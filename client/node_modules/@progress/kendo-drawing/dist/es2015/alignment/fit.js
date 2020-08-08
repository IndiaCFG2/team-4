import createTransform from '../geometry/transform';

export default function fit(element, rect) {
    const bbox = element.clippedBBox();
    if (bbox) {
        const elementSize = bbox.size;
        const rectSize = rect.size;
        if (rectSize.width < elementSize.width || rectSize.height < elementSize.height) {
            const scale = Math.min(rectSize.width / elementSize.width, rectSize.height / elementSize.height);
            const transform = element.transform() || createTransform();
            transform.scale(scale, scale);
            element.transform(transform);
        }
    }
}