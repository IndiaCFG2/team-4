import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import GRADIENTS from './gradients';
import Box from './box';

import boxDiff from './utils/box-diff';

import { DEFAULT_WIDTH, DEFAULT_HEIGHT, WHITE, BLACK } from '../common/constants';
import { getSpacing, objectKey, setDefaultOptions } from '../common';

class RootElement extends ChartElement {
    constructor(options) {
        super(options);

        const rootOptions = this.options;
        rootOptions.width = parseInt(rootOptions.width, 10);
        rootOptions.height = parseInt(rootOptions.height, 10);

        this.gradients = {};
    }

    reflow() {
        const { options, children } = this;
        let currentBox = new Box(0, 0, options.width, options.height);

        this.box = currentBox.unpad(options.margin);

        for (let i = 0; i < children.length; i++) {
            children[i].reflow(currentBox);
            currentBox = boxDiff(currentBox, children[i].box) || new Box();
        }
    }

    createVisual() {
        this.visual = new draw.Group();
        this.createBackground();
    }

    createBackground() {
        const options = this.options;
        const border = options.border || {};
        const box = this.box.clone().pad(options.margin).unpad(border.width);

        const background = draw.Path.fromRect(box.toRect(), {
            stroke: {
                color: border.width ? border.color : "",
                width: border.width,
                dashType: border.dashType
            },
            fill: {
                color: options.background,
                opacity: options.opacity
            },
            zIndex: -10
        });

        this.visual.append(background);
    }

    getRoot() {
        return this;
    }

    createGradient(options) {
        const gradients = this.gradients;
        const hashCode = objectKey(options);
        const gradient = GRADIENTS[options.gradient];
        let drawingGradient;

        if (gradients[hashCode]) {
            drawingGradient = gradients[hashCode];
        } else {
            const gradientOptions = Object.assign({}, gradient, options);
            if (gradient.type === "linear") {
                drawingGradient = new draw.LinearGradient(gradientOptions);
            } else {
                if (options.innerRadius) {
                    gradientOptions.stops = innerRadialStops(gradientOptions);
                }
                drawingGradient = new draw.RadialGradient(gradientOptions);
                drawingGradient.supportVML = gradient.supportVML !== false;
            }
            gradients[hashCode] = drawingGradient;
        }

        return drawingGradient;
    }

    cleanGradients() {
        const gradients = this.gradients;
        for (let hashCode in gradients) {
            gradients[hashCode]._observers = [];//add clear observers method in drawing ObserversMixin
        }
    }

    size() {
        const options = this.options;
        return new Box(0, 0, options.width, options.height);
    }
}

setDefaultOptions(RootElement, {
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    background: WHITE,
    border: {
        color: BLACK,
        width: 0
    },
    margin: getSpacing(5),
    zIndex: -2
});

function innerRadialStops(options) {
    const stops = options.stops;
    const usedSpace = ((options.innerRadius / options.radius) * 100);
    const length = stops.length;
    const currentStops = [];

    for (let i = 0; i < length; i++) {
        let currentStop = Object.assign({}, stops[i]);
        currentStop.offset = (currentStop.offset * (100 - usedSpace) + usedSpace) / 100;
        currentStops.push(currentStop);
    }

    return currentStops;
}

export default RootElement;