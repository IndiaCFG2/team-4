import elementStyles from './element-styles';
import defined from './defined';

function getPixels(value) {
    if (isNaN(value)) {
        return value;
    }
    return value + "px";
}

export default function elementSize(element, size) {
    if (size) {
        const { width, height } = size;

        if (defined(width)) {
            element.style.width = getPixels(width);
        }

        if (defined(height)) {
            element.style.height = getPixels(height);
        }

    } else {
        const size = elementStyles(element, [ 'width', 'height' ]);

        return {
            width: parseInt(size.width, 10),
            height: parseInt(size.height, 10)
        };
    }
}