import { drawing as draw } from '@progress/kendo-drawing';

import BoxElement from './box-element';
import TextBox from './text-box';
import ShapeElement from './shape-element';
import Box from './box';

import { CIRCLE, TOP, BOTTOM, LEFT, RIGHT, CENTER, INSIDE, OUTSIDE, NOTE_CLICK, NOTE_HOVER, NOTE_LEAVE } from '../common/constants';
import { alignPathToPixel, defined, deepExtend, eventElement, getTemplate, inArray, setDefaultOptions } from '../common';

const DEFAULT_ICON_SIZE = 7;
const DEFAULT_LABEL_COLOR = "#fff";

class Note extends BoxElement {
    constructor(fields, options, chartService) {
        super(options);

        this.fields = fields;
        this.chartService = chartService;

        this.render();
    }

    hide() {
        this.options.visible = false;
    }

    show() {
        this.options.visible = true;
    }

    render() {
        const options = this.options;

        if (options.visible) {
            const { label, icon } = options;
            const box = new Box();
            const childAlias = () => this;
            let size = icon.size;
            let text = this.fields.text;
            let width, height;

            if (defined(label) && label.visible) {
                const noteTemplate = getTemplate(label);
                if (noteTemplate) {
                    text = noteTemplate(this.fields);
                } else if (label.format) {
                    text = this.chartService.format.auto(label.format, text);
                }

                if (!label.color) {
                    label.color = label.position === INSIDE ? DEFAULT_LABEL_COLOR : icon.background;
                }

                this.label = new TextBox(text, deepExtend({}, label));
                this.label.aliasFor = childAlias;

                if (label.position === INSIDE && !defined(size)) {
                    if (icon.type === CIRCLE) {
                        size = Math.max(this.label.box.width(), this.label.box.height());
                    } else {
                        width = this.label.box.width();
                        height = this.label.box.height();
                    }
                    box.wrap(this.label.box);
                }
            }

            icon.width = width || size || DEFAULT_ICON_SIZE;
            icon.height = height || size || DEFAULT_ICON_SIZE;

            const marker = new ShapeElement(deepExtend({}, icon));
            marker.aliasFor = childAlias;

            this.marker = marker;
            this.append(marker);

            if (this.label) {
                this.append(this.label);
            }

            marker.reflow(new Box());
            this.wrapperBox = box.wrap(marker.box);
        }
    }

    reflow(targetBox) {
        const { options, label, marker, wrapperBox } = this;
        const center = targetBox.center();
        const length = options.line.length;
        const position = options.position;

        // TODO: Review
        if (options.visible) {
            let lineStart, box, contentBox;

            if (inArray(position, [ LEFT, RIGHT ])) {
                if (position === LEFT) {
                    contentBox = wrapperBox.alignTo(targetBox, position).translate(-length, targetBox.center().y - wrapperBox.center().y);

                    if (options.line.visible) {
                        lineStart = [ targetBox.x1, center.y ];
                        this.linePoints = [
                            lineStart,
                            [ contentBox.x2, center.y ]
                        ];
                        box = contentBox.clone().wrapPoint(lineStart);
                    }
                } else {
                    contentBox = wrapperBox.alignTo(targetBox, position).translate(length, targetBox.center().y - wrapperBox.center().y);

                    if (options.line.visible) {
                        lineStart = [ targetBox.x2, center.y ];
                        this.linePoints = [
                            lineStart,
                            [ contentBox.x1, center.y ]
                        ];
                        box = contentBox.clone().wrapPoint(lineStart);
                    }
                }
            } else {
                if (position === BOTTOM) {
                    contentBox = wrapperBox.alignTo(targetBox, position).translate(targetBox.center().x - wrapperBox.center().x, length);

                    if (options.line.visible) {
                        lineStart = [ center.x, targetBox.y2 ];
                        this.linePoints = [
                            lineStart,
                            [ center.x, contentBox.y1 ]
                        ];
                        box = contentBox.clone().wrapPoint(lineStart);
                    }
                } else {
                    contentBox = wrapperBox.alignTo(targetBox, position).translate(targetBox.center().x - wrapperBox.center().x, -length);

                    if (options.line.visible) {
                        lineStart = [ center.x, targetBox.y1 ];
                        this.linePoints = [
                            lineStart,
                            [ center.x, contentBox.y2 ]
                        ];
                        box = contentBox.clone().wrapPoint(lineStart);
                    }
                }
            }

            if (marker) {
                marker.reflow(contentBox);
            }

            if (label) {
                label.reflow(contentBox);
                if (marker) {
                    if (options.label.position === OUTSIDE) {
                        label.box.alignTo(marker.box, position);
                    }
                    label.reflow(label.box);
                }
            }

            this.contentBox = contentBox;
            this.targetBox = targetBox;
            this.box = box || contentBox;
        }
    }

    createVisual() {
        super.createVisual();
        this.visual.options.noclip = this.options.noclip;

        if (this.options.visible) {
            this.createLine();
        }
    }

    renderVisual() {
        const options = this.options;
        const customVisual = options.visual;
        if (options.visible && customVisual) {
            this.visual = customVisual(Object.assign(this.fields, {
                sender: this.getSender(),
                rect: this.targetBox.toRect(),
                options: {
                    background: options.background,
                    border: options.background,
                    icon: options.icon,
                    label: options.label,
                    line: options.line,
                    position: options.position,
                    visible: options.visible
                },
                createVisual: () => {
                    this.createVisual();
                    this.renderChildren();
                    const defaultVisual = this.visual;
                    delete this.visual;
                    return defaultVisual;
                }
            }));
            this.addVisual();
        } else {
            super.renderVisual();
        }
    }

    createLine() {
        const options = this.options.line;

        if (this.linePoints) {
            const path = draw.Path.fromPoints(this.linePoints, {
                stroke: {
                    color: options.color,
                    width: options.width,
                    dashType: options.dashType
                }
            });

            alignPathToPixel(path);
            this.visual.append(path);
        }
    }

    click(widget, e) {
        const args = this.eventArgs(e);

        if (!widget.trigger(NOTE_CLICK, args)) {
            e.preventDefault();
        }
    }

    over(widget, e) {
        const args = this.eventArgs(e);

        if (!widget.trigger(NOTE_HOVER, args)) {
            e.preventDefault();
        }
    }

    out(widget, e) {
        const args = this.eventArgs(e);

        widget.trigger(NOTE_LEAVE, args);
    }

    eventArgs(e) {
        const options = this.options;

        return Object.assign(this.fields, {
            element: eventElement(e),
            text: defined(options.label) ? options.label.text : "",
            visual: this.visual
        });
    }
}

setDefaultOptions(Note, {
    icon: {
        visible: true,
        type: CIRCLE
    },
    label: {
        position: INSIDE,
        visible: true,
        align: CENTER,
        vAlign: CENTER
    },
    line: {
        visible: true
    },
    visible: true,
    position: TOP,
    zIndex: 2
});

export default Note;