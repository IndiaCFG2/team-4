import TextMetrics from './text-metrics';

export default function measureText(text, style, measureBox) {
    return TextMetrics.current.measure(text, style, measureBox);
}
