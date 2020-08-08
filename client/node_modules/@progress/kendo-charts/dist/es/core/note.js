import { drawing as draw } from '@progress/kendo-drawing';

import BoxElement from './box-element';
import TextBox from './text-box';
import ShapeElement from './shape-element';
import Box from './box';

import { CIRCLE, TOP, BOTTOM, LEFT, RIGHT, CENTER, INSIDE, OUTSIDE, NOTE_CLICK, NOTE_HOVER, NOTE_LEAVE } from '../common/constants';
import { alignPathToPixel, defined, deepExtend, eventElement, getTemplate, inArray, setDefaultOptions } from '../common';

var DEFAULT_ICON_SIZE = 7;
var DEFAULT_LABEL_COLOR = "#fff";

var Note = (function (BoxElement) {
    function Note(fields, options, chartService) {
        BoxElement.call(this, options);

        this.fields = fields;
        this.chartService = chartService;

        this.render();
    }

    if ( BoxElement ) Note.__proto__ = BoxElement;
    Note.prototype = Object.create( BoxElement && BoxElement.prototype );
    Note.prototype.constructor = Note;

    Note.prototype.hide = function hide () {
        this.options.visible = false;
    };

    Note.prototype.show = function show () {
        this.options.visible = true;
    };

    Note.prototype.render = function render () {
        var this$1 = this;

        var options = this.options;

        if (options.visible) {
            var label = options.label;
            var icon = options.icon;
            var box = new Box();
            var childAlias = function () { return this$1; };
            var size = icon.size;
            var text = this.fields.text;
            var width, height;

            if (defined(label) && label.visible) {
                var noteTemplate = getTemplate(label);
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

            var marker = new ShapeElement(deepExtend({}, icon));
            marker.aliasFor = childAlias;

            this.marker = marker;
            this.append(marker);

            if (this.label) {
                this.append(this.label);
            }

            marker.reflow(new Box());
            this.wrapperBox = box.wrap(marker.box);
        }
    };

    Note.prototype.reflow = function reflow (targetBox) {
        var ref = this;
        var options = ref.options;
        var label = ref.label;
        var marker = ref.marker;
        var wrapperBox = ref.wrapperBox;
        var center = targetBox.center();
        var length = options.line.length;
        var position = options.position;

        // TODO: Review
        if (options.visible) {
            var lineStart, box, contentBox;

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
    };

    Note.prototype.createVisual = function createVisual () {
        BoxElement.prototype.createVisual.call(this);
        this.visual.options.noclip = this.options.noclip;

        if (this.options.visible) {
            this.createLine();
        }
    };

    Note.prototype.renderVisual = function renderVisual () {
        var this$1 = this;

        var options = this.options;
        var customVisual = options.visual;
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
                createVisual: function () {
                    this$1.createVisual();
                    this$1.renderChildren();
                    var defaultVisual = this$1.visual;
                    delete this$1.visual;
                    return defaultVisual;
                }
            }));
            this.addVisual();
        } else {
            BoxElement.prototype.renderVisual.call(this);
        }
    };

    Note.prototype.createLine = function createLine () {
        var options = this.options.line;

        if (this.linePoints) {
            var path = draw.Path.fromPoints(this.linePoints, {
                stroke: {
                    color: options.color,
                    width: options.width,
                    dashType: options.dashType
                }
            });

            alignPathToPixel(path);
            this.visual.append(path);
        }
    };

    Note.prototype.click = function click (widget, e) {
        var args = this.eventArgs(e);

        if (!widget.trigger(NOTE_CLICK, args)) {
            e.preventDefault();
        }
    };

    Note.prototype.over = function over (widget, e) {
        var args = this.eventArgs(e);

        if (!widget.trigger(NOTE_HOVER, args)) {
            e.preventDefault();
        }
    };

    Note.prototype.out = function out (widget, e) {
        var args = this.eventArgs(e);

        widget.trigger(NOTE_LEAVE, args);
    };

    Note.prototype.eventArgs = function eventArgs (e) {
        var options = this.options;

        return Object.assign(this.fields, {
            element: eventElement(e),
            text: defined(options.label) ? options.label.text : "",
            visual: this.visual
        });
    };

    return Note;
}(BoxElement));

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