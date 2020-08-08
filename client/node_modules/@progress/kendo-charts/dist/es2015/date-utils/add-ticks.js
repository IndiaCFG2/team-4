export default function addTicks(date, ticks) {
    return new Date(date.getTime() + ticks);
}