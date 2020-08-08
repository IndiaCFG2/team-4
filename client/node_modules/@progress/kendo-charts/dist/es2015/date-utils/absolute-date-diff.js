import { TIME_PER_MINUTE } from './constants';

export default function absoluteDateDiff(a, b) {
    const diff = a.getTime() - b;
    const offsetDiff = a.getTimezoneOffset() - b.getTimezoneOffset();

    return diff - (offsetDiff * TIME_PER_MINUTE);
}