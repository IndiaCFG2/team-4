import { drawing as draw } from '@progress/kendo-drawing';

import ChartElement from './chart-element';
import GRADIENTS from './gradients';
import Box from './box';

import boxDiff from './utils/box-diff';

import { DEFAULT_WIDTH, DEFAULT_HEIGHT, WHITE, BLACK } from '../common/constants';
import { getSpacing, objectKey, setDefaultOptions } from '../common';

var RootElement = (function (ChartElement) {
    function RootElement(options) {
        ChartElement.call(this, options);

        var rootOptions = this.options;
        rootOptions.width = parseInt(rootOptions.width, 10);
        rootOptions.height = parseInt(rootOptions.height, 10);

        this.gradients = {};
    }

    if ( ChartElement ) RootElement.__proto__ = ChartElement;
    RootElement.prototype = Object.create( ChartElement && ChartElement.prototype );
    RootElement.prototype.constructor = RootElement;

    RootElement.prototype.reflow = function reflow () {
        var ref = this;
        var options = ref.options;
        var children = ref.children;
        var currentBox = new Box(0, 0, options.width, options.height);

        this.box = currentBox.unpad(options.margin);

        for (var i = 0; i < children.length; i++) {
            children[i].reflow(currentBox);
            currentBox = boxDiff(currentBox, children[i].box) || new Box();
        }
    };

    RootElement.prototype.createVisual = function createVisual () {
        this.visual = new draw.Group();
        this.createBackground();
    };

    RootElement.prototype.createBackground = function createBackground () {
        var options = this.options;
        var border = options.border || {};
        var box = this.box.clone().pad(options.margin).unpad(border.width);

        var background = draw.Path.fromRect(box.toRect(), {
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
    };

    RootElement.prototype.getRoot = function getRoot () {
        return this;
    };

    RootElement.prototype.createGradient = function createGradient (options) {
        var gradients = this.gradients;
        var hashCode = objectKey(options);
        var gradient = GRADIENTS[options.gradient];
        var drawingGradient;

        if (gradients[hashCode]) {
            drawingGradient = gradients[hashCode];
        } else {
            var gradientOptions = Object.assign({}, gradient, options);
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
    };

    RootElement.prototype.cleanGradients = function cleanGradients () {
        var gradients = this.gradients;
        for (var hashCode in gradients) {
            gradients[hashCode]._observers = [];//add clear observers method in drawing ObserversMixin
        }
    };

    RootElement.prototype.size = function size () {
        var options = this.options;
        return new Box(0, 0, options.width, options.height);
    };

    return RootElement;
}(ChartElement));

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
    var stops = options.stops;
    var usedSpace = ((options.innerRadius / options.radius) * 100);
    var length = stops.length;
    var currentStops = [];

    for (var i = 0; i < length; i++) {
        var currentStop = Object.assign({}, stops[i]);
        currentStop.offset = (currentStop.offset * (100 - usedSpace) + usedSpace) / 100;
        currentStops.push(currentStop);
    }

    return currentStops;
}

export default RootElement;