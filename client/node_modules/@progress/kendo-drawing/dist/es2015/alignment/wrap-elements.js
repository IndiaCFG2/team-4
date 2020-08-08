import translateToPoint from './translate-to-point';
import stackElements from './stack-elements';

function getStacks(elements, rect, sizeField) {
    const maxSize = rect.size[sizeField];
    const stacks = [];
    let stack = [];
    let stackSize = 0;
    let element, bbox;

    const addElementToStack = function() {
        stack.push({
            element: element,
            bbox: bbox
        });
    };

    for (let idx = 0; idx < elements.length; idx++) {
        element = elements[idx];

        bbox = element.clippedBBox();
        if (bbox) {
            let size = bbox.size[sizeField];
            if (stackSize + size > maxSize) {
                if (stack.length) {
                    stacks.push(stack);
                    stack = [];
                    addElementToStack();
                    stackSize = size;
                } else {
                    addElementToStack();
                    stacks.push(stack);
                    stack = [];
                    stackSize = 0;
                }
            } else {
                addElementToStack();
                stackSize += size;
            }
        }
    }

    if (stack.length) {
        stacks.push(stack);
    }

    return stacks;
}

export default function wrapElements(elements, rect, axis, otherAxis, sizeField) {
    const stacks = getStacks(elements, rect, sizeField);
    const origin = rect.origin.clone();
    const result = [];

    for (let idx = 0; idx < stacks.length; idx++) {
        let stack = stacks[idx];
        let startElement = stack[0];
        origin[otherAxis] = startElement.bbox.origin[otherAxis];
        translateToPoint(origin, startElement.bbox, startElement.element);
        startElement.bbox.origin[axis] = origin[axis];
        stackElements(stack, axis, otherAxis, sizeField);
        result.push([]);
        for (let elementIdx = 0; elementIdx < stack.length; elementIdx++) {
            result[idx].push(stack[elementIdx].element);
        }
    }
    return result;
}