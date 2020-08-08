import countNumbers from './count-numbers';

export default function areNumbers(values) {
    return countNumbers(values) === values.length;
}