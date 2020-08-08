import { geometry as geom } from '@progress/kendo-drawing';

import { last } from '../../common';
import { X, Y } from '../../common/constants';

var StepLineMixin = {
    calculateStepPoints: function(points) {
        var categoryAxis = this.parent.plotArea.seriesCategoryAxis(this.series);
        var ref = categoryAxis.options;
        var justified = ref.justified;
        var vertical = ref.vertical;
        var reverse = ref.reverse;

        var stepAxis = vertical ? X : Y;
        var axis = vertical ? Y : X;
        var stepDir = reverse ? 2 : 1;
        var dir = stepDir;

        var previousPoint = toGeometryPoint(points[0], stepAxis, stepDir, axis, dir);
        var result = [ previousPoint ];

        for (var idx = 1; idx < points.length; idx++) {
            var point = toGeometryPoint(points[idx], stepAxis, stepDir, axis, dir);

            if (previousPoint[stepAxis] !== point[stepAxis]) {
                var stepPoint = new geom.Point();
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
    var box = lintPoint.box;
    var result = new geom.Point();

    result[stepAxis] = box[stepAxis + stepDir];
    result[axis] = box[axis + dir];

    return result;
}

export default StepLineMixin;