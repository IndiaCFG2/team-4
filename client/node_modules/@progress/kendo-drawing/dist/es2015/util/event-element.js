export default function eventElement(e = {}) {
    return e.touch ? e.touch.initialTouch : e.target;
}