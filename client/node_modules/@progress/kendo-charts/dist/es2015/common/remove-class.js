const SPACE_REGEX = /\s+/g;

export default function removeClass(element, className) {
    if (element && element.className) {
        element.className = element.className.replace(className, "").replace(SPACE_REGEX, " ");
    }
}