export default function elementOffset(element) {
    const box = element.getBoundingClientRect();

    const documentElement = document.documentElement;

    return {
        top: box.top + (window.pageYOffset || documentElement.scrollTop) - (documentElement.clientTop || 0),
        left: box.left + (window.pageXOffset || documentElement.scrollLeft) - (documentElement.clientLeft || 0)
    };
}