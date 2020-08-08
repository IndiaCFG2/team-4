import LinePoint from '../line-chart/line-point';

class RangeLinePoint extends LinePoint {
    aliasFor() {
        return this.parent;
    }
}

export default RangeLinePoint;