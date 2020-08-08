import { DEFAULT_PRECISION } from '../../common/constants';
import { round } from '../../common';

export default function autoMajorUnit(min, max) {
    let diff = round(max - min, DEFAULT_PRECISION - 1);

    if (diff === 0) {
        if (max === 0) {
            return 0.1;
        }

        diff = Math.abs(max);
    }

    const scale = Math.pow(10, Math.floor(Math.log(diff) / Math.log(10)));
    const relativeValue = round((diff / scale), DEFAULT_PRECISION);
    let scaleMultiplier = 1;

    if (relativeValue < 1.904762) {
        scaleMultiplier = 0.2;
    } else if (relativeValue < 4.761904) {
        scaleMultiplier = 0.5;
    } else if (relativeValue < 9.523809) {
        scaleMultiplier = 1;
    } else {
        scaleMultiplier = 2;
    }

    return round(scale * scaleMultiplier, DEFAULT_PRECISION);
}