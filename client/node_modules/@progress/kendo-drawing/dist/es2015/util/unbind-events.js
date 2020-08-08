export default function unbindEvents(element, events = {}) {
    for (let name in events) {
        const eventNames = name.trim().split(" ");
        for (let idx = 0; idx < eventNames.length; idx++) {
            element.removeEventListener(eventNames[idx], events[name], false);
        }
    }
}