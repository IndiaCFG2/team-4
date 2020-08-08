import { geometry as geom } from '@progress/kendo-drawing';

import { last } from '../../common';
import { X, Y } from '../../common/constants';

const StepLineMixin = {
    calculateStepPoints: function(points) {
        const categoryAxis = this.parent.plotArea.seriesCategoryAxis(this.series);
        const { justified, vertical, reverse } = categoryAxis.options;

        const stepAxis = vertical ? X : Y;
        const axis = vertical ? Y : X;
        const stepDir = reverse ? 2 : 1;
        const dir = stepDir;

        let previousPoint = toGeometryPoint(points[0], stepAxis, stepDir, axis, dir);
        const result = [ previousPoint ];

        for (let idx = 1; idx < points.length; idx++) {
            const point = toGeometryPoint(points[idx], stepAxis, stepDir, axis, dir);

            if (previousPoint[stepAxis] !== point[stepAxis]) {
                const stepPoint = new geom.Point();
                stepPoint[stepAxis] = previousPoint[stepAxis];
                stepPoint[axis] = point[axis];

                result.push(stepPoint, point);
            }

            previousPoint = point;
        }

        if (!justified) {
            result.push(toGeometryPoint(last(points), stepAxis, stepDir, axis, reverse ? 1 : 2));
        } else if (previousPoint !== last(result)) {
            result.push(previousPoint);
        }

        return result;

    }
};

function toGeometryPoint(lintPoint, stepAxis, stepDir, axis, dir) {
    const box = lintPoint.box;
    const result = new geom.Point();

    result[stepAxis] = box[stepAxis + stepDir];
    result[axis] = box[axis + dir];

    return result;
}

export default StepLineMixin;