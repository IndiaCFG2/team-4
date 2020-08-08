export default function acceptKey(e, mouseKey) {
    const key = (mouseKey || "").toLowerCase();
    const event = e.event;
    const accept = (key === "none" && !(event.ctrlKey || event.shiftKey || event.altKey)) || event[key + "Key"];

    return accept;
}