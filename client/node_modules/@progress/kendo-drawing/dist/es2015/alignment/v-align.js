import alignElements from './align-elements';

export default function vAlign(elements, rect, alignment) {
    alignElements(elements, rect, alignment, "y", "height");
}