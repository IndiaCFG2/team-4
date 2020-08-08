export default function acceptKey(e, mouseKey) {
    var key = (mouseKey || "").toLowerCase();
    var event = e.event;
    var accept = (key === "none" && !(event.ctrlKey || event.shiftKey || event.altKey)) || event[key + "Key"];

    return accept;
}