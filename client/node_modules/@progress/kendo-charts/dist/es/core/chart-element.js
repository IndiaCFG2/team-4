import { drawing as draw } from '@progress/kendo-drawing';

import { WHITE } from '../common/constants';
import { Class, deepExtend, defined, valueOrDefault } from '../common';

var ChartElement = (function (Class) {
    function ChartElement(options) {
        Class.call(this);

        this.children = [];

        this.options = deepExtend({}, this.options, this.initUserOptions(options));
    }

    if ( Class ) ChartElement.__proto__ = Class;
    ChartElement.prototype = Object.create( Class && Class.prototype );
    ChartElement.prototype.constructor = ChartElement;

    ChartElement.prototype.initUserOptions = function initUserOptions (options) {
        return options;
    };

    ChartElement.prototype.reflow = function reflow (targetBox) {
        var children = this.children;
        var box;

        for (var i = 0; i < children.length; i++) {
            var currentChild = children[i];
            currentChild.reflow(targetBox);

            box = box ? box.wrap(currentChild.box) : currentChild.box.clone();
        }

        this.box = box || targetBox;
    };

    ChartElement.prototype.destroy = function destroy () {
        var children = this.children;

        if (this.animation) {
            this.animation.destroy();
        }

        for (var i = 0; i < children.length; i++) {
            children[i].destroy();
        }
    };

    ChartElement.prototype.getRoot = function getRoot () {
        var parent = this.parent;

        return parent ? parent.getRoot() : null;
    };

    ChartElement.prototype.getSender = function getSender () {
        var service = this.getService();
        if (service) {
            return service.sender;
        }
    };

    ChartElement.prototype.getService = function getService () {
        var element = this;
        while (element) {
            if (element.chartService) {
                return element.chartService;
            }
            element = element.parent;
        }
    };

    ChartElement.prototype.translateChildren = function translateChildren (dx, dy) {
        var children = this.children;
        var childrenCount = children.length;

        for (var i = 0; i < childrenCount; i++) {
            children[i].box.translate(dx, dy);
        }
    };

    ChartElement.prototype.append = function append () {
        var arguments$1 = arguments;
        var this$1 = this;

        for (var i = 0; i < arguments.length; i++) {
            var item = arguments$1[i];
            this$1.children.push(item);
            item.parent = this$1;
        }
    };

    ChartElement.prototype.renderVisual = function renderVisual () {
        if (this.options.visible === false) {
            return;
        }

        this.createVisual();

        this.addVisual();

        this.renderChildren();

        this.createAnimation();
        this.renderComplete();
    };

    ChartElement.prototype.addVisual = function addVisual () {
        if (this.visual) {
            this.visual.chartElement = this;

            if (this.parent) {
                this.parent.appendVisual(this.visual);
            }
        }
    };

    ChartElement.prototype.renderChildren = function renderChildren () {
        var children = this.children;
        var length = children.length;
        for (var i = 0; i < length; i++) {
            children[i].renderVisual();
        }
    };

    ChartElement.prototype.createVisual = function createVisual () {
        this.visual = new draw.Group({
            zIndex: this.options.zIndex,
            visible: valueOrDefault(this.options.visible, true)
        });
    };

    ChartElement.prototype.createAnimation = function createAnimation () {
        if (this.visual && this.options.animation) {
            this.animation = draw.Animation.create(
                this.visual, this.options.animation
            );
        }
    };

    ChartElement.prototype.appendVisual = function appendVisual (childVisual) {
        if (!childVisual.chartElement) {
            childVisual.chartElement = this;
        }

        if (childVisual.options.noclip) {
            this.clipRoot().visual.append(childVisual);
        } else if (defined(childVisual.options.zIndex)) {
            this.stackRoot().stackVisual(childVisual);
        } else if (this.isStackRoot) {
            this.stackVisual(childVisual);
        } else if (this.visual) {
            this.visual.append(childVisual);
        } else {
            // Allow chart elements without visuals to
            // pass through child visuals
            this.parent.appendVisual(childVisual);
        }
    };

    ChartElement.prototype.clipRoot = function clipRoot () {
        if (this.parent) {
            return this.parent.clipRoot();
        }

        return this;
    };

    ChartElement.prototype.stackRoot = function stackRoot () {
        if (this.parent) {
            return this.parent.stackRoot();
        }

        return this;
    };

    ChartElement.prototype.stackVisual = function stackVisual (childVisual) {
        var zIndex = childVisual.options.zIndex || 0;
        var visuals = this.visual.children;
        var length = visuals.length;
        var pos;

        for (pos = 0; pos < length; pos++) {
            var sibling = visuals[pos];
            var here = valueOrDefault(sibling.options.zIndex, 0);
            if (here > zIndex) {
                break;
            }
        }

        this.visual.insert(pos, childVisual);
    };

    ChartElement.prototype.traverse = function traverse (callback) {
        var children = this.children;
        var length = children.length;

        for (var i = 0; i < length; i++) {
            var child = children[i];

            callback(child);
            if (child.traverse) {
                child.traverse(callback);
            }
        }
    };

    ChartElement.prototype.closest = function closest (match) {
        var element = this;
        var matched = false;

        while (element && !matched) {
            matched = match(element);

            if (!matched) {
                element = element.parent;
            }
        }

        if (matched) {
            return element;
        }
    };

    ChartElement.prototype.renderComplete = function renderComplete () {};

    ChartElement.prototype.hasHighlight = function hasHighlight () {
        var options = (this.options || {}).highlight;
        return !(!this.createHighlight || (options && options.visible === false));
    };

    ChartElement.prototype.toggleHighlight = function toggleHighlight (show) {
        var this$1 = this;

        var options = (this.options || {}).highlight || {};
        var customVisual = options.visual;
        var highlight = this._highlight;

        if (!highlight) {
            var highlightOptions = {
                fill: {
                    color: WHITE,
                    opacity: 0.2
                },
                stroke: {
                    color: WHITE,
                    width: 1,
                    opacity: 0.2
                }
            };

            if (customVisual) {
                highlight = this._highlight = customVisual(
                    Object.assign(this.highlightVisualArgs(), {
                        createVisual: function () { return this$1.createHighlight(highlightOptions); },
                        sender: this.getSender(),
                        series: this.series,
                        dataItem: this.dataItem,
                        category: this.category,
                        value: this.value,
                        percentage: this.percentage,
                        runningTotal: this.runningTotal,
                        total: this.total
                    }
                ));

                if (!highlight) {
                    return;
                }
            } else {
                highlight = this._highlight = this.createHighlight(highlightOptions);
            }

            if (!defined(highlight.options.zIndex)) {
                highlight.options.zIndex = valueOrDefault(options.zIndex, this.options.zIndex);
            }

            this.appendVisual(highlight);
        }

        highlight.visible(show);
    };

    ChartElement.prototype.createGradientOverlay = function createGradientOverlay (element, options, gradientOptions) {
        var overlay = new draw.Path(Object.assign({
            stroke: {
                color: "none"
            },
            fill: this.createGradient(gradientOptions),
            closed: element.options.closed
        }, options));

        overlay.segments.elements(element.segments.elements());

        return overlay;
    };

    ChartElement.prototype.createGradient = function createGradient (options) {
        if (this.parent) {
            return this.parent.createGradient(options);
        }
    };

    return ChartElement;
}(Class));

ChartElement.prototype.options = { };

export default ChartElement;