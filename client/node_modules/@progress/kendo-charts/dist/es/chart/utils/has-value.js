import { defined } from '../../common';

export default function hasValue(value) {
    return defined(value) && value !== null;
}