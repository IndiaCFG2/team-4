import { TOP, BOTTOM, LEFT, RIGHT } from './constants';

export default function getSpacing(value, defaultSpacing = 0) {
    const spacing = { top: 0, right: 0, bottom: 0, left: 0 };

    if (typeof(value) === "number") {
        spacing[TOP] = spacing[RIGHT] = spacing[BOTTOM] = spacing[LEFT] = value;
    } else {
        spacing[TOP] = value[TOP] || defaultSpacing;
        spacing[RIGHT] = value[RIGHT] || defaultSpacing;
        spacing[BOTTOM] = value[BOTTOM] || defaultSpacing;
        spacing[LEFT] = value[LEFT] || defaultSpacing;
    }

    return spacing;
}