export default function bindEvents(element, events) {
    for (let eventName in events) {
        const eventNames = eventName.trim().split(" ");
        for (let idx = 0; idx < eventNames.length; idx++) {
            element.addEventListener(eventNames[idx], events[eventName], false);
        }
    }
}