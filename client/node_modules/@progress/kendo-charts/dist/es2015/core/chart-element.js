import { drawing as draw } from '@progress/kendo-drawing';

import { WHITE } from '../common/constants';
import { Class, deepExtend, defined, valueOrDefault } from '../common';

class ChartElement extends Class {
    constructor(options) {
        super();

        this.children = [];

        this.options = deepExtend({}, this.options, this.initUserOptions(options));
    }

    initUserOptions(options) {
        return options;
    }

    reflow(targetBox) {
        const children = this.children;
        let box;

        for (let i = 0; i < children.length; i++) {
            let currentChild = children[i];
            currentChild.reflow(targetBox);

            box = box ? box.wrap(currentChild.box) : currentChild.box.clone();
        }

        this.box = box || targetBox;
    }

    destroy() {
        const children = this.children;

        if (this.animation) {
            this.animation.destroy();
        }

        for (let i = 0; i < children.length; i++) {
            children[i].destroy();
        }
    }

    getRoot() {
        const parent = this.parent;

        return parent ? parent.getRoot() : null;
    }

    getSender() {
        const service = this.getService();
        if (service) {
            return service.sender;
        }
    }

    getService() {
        let element = this;
        while (element) {
            if (element.chartService) {
                return element.chartService;
            }
            element = element.parent;
        }
    }

    translateChildren(dx, dy) {
        const children = this.children;
        const childrenCount = children.length;

        for (let i = 0; i < childrenCount; i++) {
            children[i].box.translate(dx, dy);
        }
    }

    append() {
        for (let i = 0; i < arguments.length; i++) {
            let item = arguments[i];
            this.children.push(item);
            item.parent = this;
        }
    }

    renderVisual() {
        if (this.options.visible === false) {
            return;
        }

        this.createVisual();

        this.addVisual();

        this.renderChildren();

        this.createAnimation();
        this.renderComplete();
    }

    addVisual() {
        if (this.visual) {
            this.visual.chartElement = this;

            if (this.parent) {
                this.parent.appendVisual(this.visual);
            }
        }
    }

    renderChildren() {
        const children = this.children;
        const length = children.length;
        for (let i = 0; i < length; i++) {
            children[i].renderVisual();
        }
    }

    createVisual() {
        this.visual = new draw.Group({
            zIndex: this.options.zIndex,
            visible: valueOrDefault(this.options.visible, true)
        });
    }

    createAnimation() {
        if (this.visual && this.options.animation) {
            this.animation = draw.Animation.create(
                this.visual, this.options.animation
            );
        }
    }

    appendVisual(childVisual) {
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
    }

    clipRoot() {
        if (this.parent) {
            return this.parent.clipRoot();
        }

        return this;
    }

    stackRoot() {
        if (this.parent) {
            return this.parent.stackRoot();
        }

        return this;
    }

    stackVisual(childVisual) {
        const zIndex = childVisual.options.zIndex || 0;
        const visuals = this.visual.children;
        const length = visuals.length;
        let pos;

        for (pos = 0; pos < length; pos++) {
            let sibling = visuals[pos];
            let here = valueOrDefault(sibling.options.zIndex, 0);
            if (here > zIndex) {
                break;
            }
        }

        this.visual.insert(pos, childVisual);
    }

    traverse(callback) {
        const children = this.children;
        const length = children.length;

        for (let i = 0; i < length; i++) {
            let child = children[i];

            callback(child);
            if (child.traverse) {
                child.traverse(callback);
            }
        }
    }

    closest(match) {
        let element = this;
        let matched = false;

        while (element && !matched) {
            matched = match(element);

            if (!matched) {
                element = element.parent;
            }
        }

        if (matched) {
            return element;
        }
    }

    renderComplete() {}

    hasHighlight() {
        const options = (this.options || {}).highlight;
        return !(!this.createHighlight || (options && options.visible === false));
    }

    toggleHighlight(show) {
        const options = (this.options || {}).highlight || {};
        const customVisual = options.visual;
        let highlight = this._highlight;

        if (!highlight) {
            const highlightOptions = {
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
                        createVisual: () => this.createHighlight(highlightOptions),
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
    }

    createGradientOverlay(element, options, gradientOptions) {
        const overlay = new draw.Path(Object.assign({
            stroke: {
                color: "none"
            },
            fill: this.createGradient(gradientOptions),
            closed: element.options.closed
        }, options));

        overlay.segments.elements(element.segments.elements());

        return overlay;
    }

    createGradient(options) {
        if (this.parent) {
            return this.parent.createGradient(options);
        }
    }
}

ChartElement.prototype.options = { };

export default ChartElement;