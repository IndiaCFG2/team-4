import Point from '../geometry/point';
import { last } from '../util';

const ShapeMap = {
    l: function(path, options) {
        const { parameters, position } = options;

        for (let i = 0; i < parameters.length; i += 2) {
            let point = new Point(parameters[i], parameters[i + 1]);

            if (options.isRelative) {
                point.translateWith(position);
            }

            path.lineTo(point.x, point.y);

            position.x = point.x;
            position.y = point.y;
        }
    },

    c: function(path, options) {
        const { parameters, position } = options;

        for (let i = 0; i < parameters.length; i += 6) {
            let controlOut = new Point(parameters[i], parameters[i + 1]);
            let controlIn = new Point(parameters[i + 2], parameters[i + 3]);
            let point = new Point(parameters[i + 4], parameters[i + 5]);
            if (options.isRelative) {
                controlIn.translateWith(position);
                controlOut.translateWith(position);
                point.translateWith(position);
            }

            path.curveTo(controlOut, controlIn, point);

            position.x = point.x;
            position.y = point.y;
        }
    },

    v: function(path, options) {
        const value = options.isRelative ? 0 : options.position.x;

        toLineParamaters(options.parameters, true, value);
        this.l(path, options);
    },

    h: function(path, options) {
        const value = options.isRelative ? 0 : options.position.y;

        toLineParamaters(options.parameters, false, value);
        this.l(path, options);
    },

    a: function(path, options) {
        const { parameters, position } = options;

        for (let i = 0; i < parameters.length; i += 7) {
            const radiusX = parameters[i];
            const radiusY = parameters[i + 1];
            const rotation = parameters[i + 2];
            const largeArc = parameters[i + 3];
            const swipe = parameters[i + 4];
            const endPoint = new Point(parameters[i + 5], parameters[i + 6]);

            if (options.isRelative) {
                endPoint.translateWith(position);
            }
            if (position.x !== endPoint.x || position.y !== endPoint.y) {
                path.arcTo(endPoint, radiusX, radiusY, largeArc, swipe, rotation);

                position.x = endPoint.x;
                position.y = endPoint.y;
            }
        }
    },

    s: function(path, options) {
        const { parameters, position, previousCommand } = options;
        let lastControlIn;

        if (previousCommand === "s" || previousCommand === "c") {
            lastControlIn = last(last(path.paths).segments).controlIn();
        }

        for (let i = 0; i < parameters.length; i += 4) {
            let controlIn = new Point(parameters[i], parameters[i + 1]);
            let endPoint = new Point(parameters[i + 2], parameters[i + 3]);
            let controlOut;

            if (options.isRelative) {
                controlIn.translateWith(position);
                endPoint.translateWith(position);
            }

            if (lastControlIn) {
                controlOut = reflectionPoint(lastControlIn, position);
            } else {
                controlOut = position.clone();
            }

            lastControlIn = controlIn;

            path.curveTo(controlOut, controlIn, endPoint);

            position.x = endPoint.x;
            position.y = endPoint.y;
        }
    },

    q: function(path, options) {
        const { parameters, position } = options;

        for (let i = 0; i < parameters.length; i += 4) {
            let controlPoint = new Point(parameters[i], parameters[i + 1]);
            let endPoint = new Point(parameters[i + 2], parameters[i + 3]);

            if (options.isRelative) {
                controlPoint.translateWith(position);
                endPoint.translateWith(position);
            }

            let cubicControlPoints = quadraticToCubicControlPoints(position, controlPoint, endPoint);

            path.curveTo(cubicControlPoints.controlOut, cubicControlPoints.controlIn, endPoint);

            position.x = endPoint.x;
            position.y = endPoint.y;
        }
    },

    t: function(path, options) {
        const { parameters, position, previousCommand } = options;
        let controlPoint;

        if (previousCommand === "q" || previousCommand === "t") {
            let lastSegment = last(last(path.paths).segments);
            controlPoint = lastSegment.controlIn().clone()
                .translateWith(position.scaleCopy(-1 / 3))
                .scale(3 / 2);
        }

        for (let i = 0; i < parameters.length; i += 2) {
            let endPoint = new Point(parameters[i], parameters[i + 1]);
            if (options.isRelative) {
                endPoint.translateWith(position);
            }

            if (controlPoint) {
                controlPoint = reflectionPoint(controlPoint, position);
            } else {
                controlPoint = position.clone();
            }

            let cubicControlPoints = quadraticToCubicControlPoints(position, controlPoint, endPoint);

            path.curveTo(cubicControlPoints.controlOut, cubicControlPoints.controlIn, endPoint);

            position.x = endPoint.x;
            position.y = endPoint.y;
        }
    }
};

function toLineParamaters(parameters, isVertical, value) {
    const insertPosition = isVertical ? 0 : 1;

    for (let i = 0; i < parameters.length; i += 2) {
        parameters.splice(i + insertPosition, 0, value);
    }
}

function reflectionPoint(point, center) {
    if (point && center) {
        return center.scaleCopy(2).translate(-point.x, -point.y);
    }
}

const third = 1 / 3;

function quadraticToCubicControlPoints(position, controlPoint, endPoint) {
    const scaledPoint = controlPoint.clone().scale(2 / 3);
    return {
        controlOut: scaledPoint.clone().translateWith(position.scaleCopy(third)),
        controlIn: scaledPoint.translateWith(endPoint.scaleCopy(third))
    };
}

export default ShapeMap;