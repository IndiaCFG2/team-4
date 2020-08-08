import { defined } from '../../common';

export default function anyHasZIndex(elements) {
    for (let idx = 0; idx < elements.length; idx++) {
        if (defined(elements[idx].zIndex)) {
            return true;
        }
    }
}