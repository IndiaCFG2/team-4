export default function createStackElements(elements) {
    const stackElements = [];

    for (let idx = 0; idx < elements.length; idx++) {
        let element = elements[idx];
        let bbox = element.clippedBBox();
        if (bbox) {
            stackElements.push({
                element: element,
                bbox: bbox
            });
        }
    }

    return stackElements;
}