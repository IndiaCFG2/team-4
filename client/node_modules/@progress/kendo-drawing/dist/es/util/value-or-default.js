import defined from './defined';

export default function valueOrDefault(value, defaultValue) {
    return defined(value) ? value : defaultValue;
}