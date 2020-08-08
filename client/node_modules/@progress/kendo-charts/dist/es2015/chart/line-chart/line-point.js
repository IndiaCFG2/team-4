import { geometry as geom, Color } from '@progress/kendo-drawing';

import { ChartElement, TextBox, ShapeElement, Box, Point } from '../../core';

import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';
import { LINE_MARKER_SIZE, FADEIN, INITIAL_ANIMATION_DURATION, BORDER_BRIGHTNESS, TOOLTIP_OFFSET, ABOVE, BELOW } from '../constants';

import { WHITE, CIRCLE, CENTER, TOP, BOTTOM, LEFT, HIGHLIGHT_ZINDEX } from '../../common/constants';
import { deepExtend, defined, getTemplate, valueOrDefault, getSpacing } from '../../common';

class LinePoint extends ChartElement {
    constructor(value, options) {
        super();

        this.value = value;
        this.options = options;
        this.aboveAxis = valueOrDefault(this.options.aboveAxis, true);
        this.tooltipTracking = true;
    }

    render() {
        const { markers, labels } = this.options;

        if (this._rendered) {
            return;
        }

        this._rendered = true;

        if (markers.visible && markers.size) {
            this.marker = this.createMarker();
            this.append(this.marker);
        }

        if (labels.visible) {
            const labelTemplate = getTemplate(labels);
            const pointData = this.pointData();
            let labelText = this.value;
            if (labelTemplate) {
                labelText = labelTemplate(pointData);
            } else if (labels.format) {
                labelText = this.formatValue(labels.format);
            }
            this.label = new TextBox(labelText,
                deepExtend({
                    align: CENTER,
                    vAlign: CENTER,
                    margin: {
                        left: 5,
                        right: 5
                    },
                    zIndex: valueOrDefault(labels.zIndex, this.series.zIndex)
                }, labels),
                pointData
            );
            this.append(this.label);
        }

        this.createNote();

        if (this.errorBar) {
            this.append(this.errorBar);
        }
    }

    markerBorder() {
        const options = this.options.markers;
        const background = options.background;
        const border = deepExtend({ color: this.color }, options.border);

        if (!defined(border.color)) {
            border.color = new Color(background).brightness(BORDER_BRIGHTNESS).toHex();
        }

        return border;
    }

    createVisual() {}

    createMarker() {
        const options = this.options.markers;
        const marker = new ShapeElement({
            type: options.type,
            width: options.size,
            height: options.size,
            rotation: options.rotation,
            background: options.background,
            border: this.markerBorder(),
            opacity: options.opacity,
            zIndex: valueOrDefault(options.zIndex, this.series.zIndex),
            animation: options.animation,
            visual: options.visual
        }, {
            dataItem: this.dataItem,
            value: this.value,
            series: this.series,
            category: this.category
        });

        return marker;
    }

    markerBox() {
        if (!this.marker) {
            this.marker = this.createMarker();
            this.marker.reflow(this._childBox);
        }

        return this.marker.box;
    }

    reflow(targetBox) {
        const { options, aboveAxis } = this;
        const vertical = options.vertical;

        this.render();

        this.box = targetBox;
        const childBox = targetBox.clone();

        if (vertical) {
            if (aboveAxis) {
                childBox.y1 -= childBox.height();
            } else {
                childBox.y2 += childBox.height();
            }
        } else {
            if (aboveAxis) {
                childBox.x1 += childBox.width();
            } else {
                childBox.x2 -= childBox.width();
            }
        }

        this._childBox = childBox;
        if (this.marker) {
            this.marker.reflow(childBox);
        }

        this.reflowLabel(childBox);

        if (this.errorBars) {
            for (let i = 0; i < this.errorBars.length; i++) {
                this.errorBars[i].reflow(childBox);
            }
        }

        if (this.note) {
            let noteTargetBox = this.markerBox();

            if (!(options.markers.visible && options.markers.size)) {
                const center = noteTargetBox.center();
                noteTargetBox = new Box(center.x, center.y, center.x, center.y);
            }

            this.note.reflow(noteTargetBox);
        }
    }

    reflowLabel(box) {
        const { options, label } = this;
        let anchor = options.labels.position;

        if (label) {
            anchor = anchor === ABOVE ? TOP : anchor;
            anchor = anchor === BELOW ? BOTTOM : anchor;

            label.reflow(box);
            label.box.alignTo(this.markerBox(), anchor);
            label.reflow(label.box);
        }
    }

    createHighlight() {
        const markers = this.options.highlight.markers;
        const defaultColor = this.markerBorder().color;
        const options = this.options.markers;
        const size = options.size + (options.border.width || 0) + (markers.border.width || 0);

        const shadow = new ShapeElement({
            type: options.type,
            width: size,
            height: size,
            rotation: options.rotation,
            background: markers.color || defaultColor,
            border: {
                color: markers.border.color,
                width: markers.border.width,
                opacity: valueOrDefault(markers.border.opacity, 1)
            },
            opacity: valueOrDefault(markers.opacity, 1)
        });
        shadow.reflow(this._childBox);

        return shadow.getElement();
    }

    highlightVisual() {
        return (this.marker || {}).visual;
    }

    highlightVisualArgs() {
        const marker = this.marker;
        let visual, rect;

        if (marker) {
            rect = marker.paddingBox.toRect();
            visual = marker.visual;
        } else {
            const size = this.options.markers.size;
            const halfSize = size / 2;
            const center = this.box.center();
            rect = new geom.Rect([ center.x - halfSize, center.y - halfSize ], [ size, size ]);
        }

        return {
            options: this.options,
            rect: rect,
            visual: visual
        };
    }

    tooltipAnchor() {
        const markerBox = this.markerBox();
        const clipBox = this.owner.pane.clipBox();
        const showTooltip = !clipBox || clipBox.overlaps(markerBox);

        if (showTooltip) {
            const x = markerBox.x2 + TOOLTIP_OFFSET;
            const horizontalAlign = LEFT;
            let y, verticalAlign;

            if (this.aboveAxis) {
                y = markerBox.y1;
                verticalAlign = BOTTOM;
            } else {
                y = markerBox.y2;
                verticalAlign = TOP;
            }

            return {
                point: new Point(x, y),
                align: {
                    horizontal: horizontalAlign,
                    vertical: verticalAlign
                }
            };
        }
    }

    formatValue(format) {
        return this.owner.formatPointValue(this, format);
    }

    overlapsBox(box) {
        const markerBox = this.markerBox();
        return markerBox.overlaps(box);
    }

    unclipElements() {
        if (this.label) {
            this.label.options.noclip = true;
        }

        if (this.note) {
            this.note.options.noclip = true;
        }
    }

    pointData() {
        return {
            dataItem: this.dataItem,
            category: this.category,
            value: this.value,
            percentage: this.percentage,
            stackValue: this.stackValue,
            series: this.series
        };
    }
}

LinePoint.prototype.defaults = {
    vertical: true,
    markers: {
        visible: true,
        background: WHITE,
        size: LINE_MARKER_SIZE,
        type: CIRCLE,
        border: {
            width: 2
        },
        opacity: 1
    },
    labels: {
        visible: false,
        position: ABOVE,
        margin: getSpacing(3),
        padding: getSpacing(4),
        animation: {
            type: FADEIN,
            delay: INITIAL_ANIMATION_DURATION
        }
    },
    notes: {
        label: {}
    },
    highlight: {
        markers: {
            border: {
                color: "#fff",
                width: 2
            }
        },
        zIndex: HIGHLIGHT_ZINDEX
    },
    errorBars: {
        line: {
            width: 1
        }
    }
};

deepExtend(LinePoint.prototype, PointEventsMixin);
deepExtend(LinePoint.prototype, NoteMixin);

export default LinePoint;
