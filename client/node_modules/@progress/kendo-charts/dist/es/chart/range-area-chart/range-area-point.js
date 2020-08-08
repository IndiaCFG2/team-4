import { drawing as draw } from '@progress/kendo-drawing';

import { ChartElement, Point } from '../../core';
import RangeLinePoint from './range-line-point';
import PointEventsMixin from '../mixins/point-events-mixin';
import NoteMixin from '../mixins/note-mixin';

import { LINE_MARKER_SIZE, FADEIN, INITIAL_ANIMATION_DURATION, TOOLTIP_OFFSET, ABOVE, BELOW } from '../constants';
import { WHITE, CIRCLE, HIGHLIGHT_ZINDEX, LEFT, RIGHT, BOTTOM, CENTER } from '../../common/constants';
import { deepExtend, valueOrDefault, getSpacing } from '../../common';

var AUTO = 'auto';
var DEFAULT_FROM_FORMAT = '{0}';
var DEFAULT_TO_FORMAT = '{1}';

var RangeAreaPoint = (function (ChartElement) {
    function RangeAreaPoint(value, options) {
        ChartElement.call(this);

        this.value = value;
        this.options = options;
        this.aboveAxis = valueOrDefault(this.options.aboveAxis, true);
        this.tooltipTracking = true;
        this.initLabelsFormat();
    }

    if ( ChartElement ) RangeAreaPoint.__proto__ = ChartElement;
    RangeAreaPoint.prototype = Object.create( ChartElement && ChartElement.prototype );
    RangeAreaPoint.prototype.constructor = RangeAreaPoint;

    RangeAreaPoint.prototype.render = function render () {
        if (this._rendered) {
            return;
        }

        this._rendered = true;

        var ref = this.options;
        var markers = ref.markers;
        var labels = ref.labels;
        var value = this.value;

        var fromPoint = this.fromPoint = new RangeLinePoint(value, deepExtend({}, this.options, {
            labels: labels.from,
            markers: markers.from
        }));

        var toPoint = this.toPoint = new RangeLinePoint(value, deepExtend({}, this.options, {
            labels: labels.to,
            markers: markers.to
        }));

        this.copyFields(fromPoint);
        this.copyFields(toPoint);

        this.append(fromPoint);
        this.append(toPoint);
    };

    RangeAreaPoint.prototype.reflow = function reflow (targetBox) {
        this.render();

        var fromBox = targetBox.from;
        var toBox = targetBox.to;

        this.positionLabels(fromBox, toBox);

        this.fromPoint.reflow(fromBox);
        this.toPoint.reflow(toBox);

        this.box = this.fromPoint.markerBox().clone().wrap(this.toPoint.markerBox());
    };

    RangeAreaPoint.prototype.createHighlight = function createHighlight () {
        var group = new draw.Group();
        group.append(this.fromPoint.createHighlight());
        group.append(this.toPoint.createHighlight());

        return group;
    };

    RangeAreaPoint.prototype.highlightVisual = function highlightVisual () {
        return this.visual;
    };

    RangeAreaPoint.prototype.highlightVisualArgs = function highlightVisualArgs () {
        return {
            options: this.options,
            from: this.fromPoint.highlightVisualArgs(),
            to: this.toPoint.highlightVisualArgs()
        };
    };

    RangeAreaPoint.prototype.tooltipAnchor = function tooltipAnchor () {
        var clipBox = this.owner.pane.clipBox();
        var showTooltip = !clipBox || clipBox.overlaps(this.box);

        if (showTooltip) {
            var box = this.box;
            var center = box.center();
            var horizontalAlign = LEFT;
            var x, y, verticalAlign;

            if (this.options.vertical) {
                x = center.x;
                y = box.y1 - TOOLTIP_OFFSET;
                verticalAlign = BOTTOM;
            } else {
                x = box.x2 + TOOLTIP_OFFSET;
                y = center.y;
                verticalAlign = CENTER;
            }

            return {
                point: new Point(x, y),
                align: {
                    horizontal: horizontalAlign,
                    vertical: verticalAlign
                }
            };
        }
    };

    RangeAreaPoint.prototype.formatValue = function formatValue (format) {
        return this.owner.formatPointValue(this, format);
    };

    RangeAreaPoint.prototype.overlapsBox = function overlapsBox (box) {
        return this.box.overlaps(box);
    };

    RangeAreaPoint.prototype.unclipElements = function unclipElements () {
        this.fromPoint.unclipElements();
        this.toPoint.unclipElements();
    };

    RangeAreaPoint.prototype.initLabelsFormat = function initLabelsFormat () {
        var labels = this.options.labels;
        if (!labels.format) {
            if (!labels.from || !labels.from.format) {
                labels.from = Object.assign({}, labels.from, {
                    format: DEFAULT_FROM_FORMAT
                });
            }

            if (!labels.to || !labels.to.format) {
                labels.to = Object.assign({}, labels.to, {
                    format: DEFAULT_TO_FORMAT
                });
            }
        }
    };

    RangeAreaPoint.prototype.positionLabels = function positionLabels (fromBox, toBox) {
        var ref = this.options;
        var labels = ref.labels;
        var vertical = ref.vertical;

        if (labels.position === AUTO) {
            var fromLabelPosition, toLabelPosition;
            if (vertical) {
                if (toBox.y1 <= fromBox.y1) {
                    toLabelPosition = ABOVE;
                    fromLabelPosition = BELOW;
                } else {
                    toLabelPosition = BELOW;
                    fromLabelPosition = ABOVE;
                }
            } else {
                if (toBox.x1 <= fromBox.x1) {
                    toLabelPosition = LEFT;
                    fromLabelPosition = RIGHT;
                } else {
                    toLabelPosition = RIGHT;
                    fromLabelPosition = LEFT;
                }
            }

            if (!labels.from || !labels.from.position) {
                this.fromPoint.options.labels.position = fromLabelPosition;
            }

            if (!labels.to || !labels.to.position) {
                this.toPoint.options.labels.position = toLabelPosition;
            }
        }
    };

    RangeAreaPoint.prototype.copyFields = function copyFields (point) {
        point.dataItem = this.dataItem;
        point.category = this.category;
        point.series = this.series;
        point.color = this.color;
        point.owner = this.owner;
    };

    return RangeAreaPoint;
}(ChartElement));

deepExtend(RangeAreaPoint.prototype, PointEventsMixin);
deepExtend(RangeAreaPoint.prototype, NoteMixin);

RangeAreaPoint.prototype.defaults = {
    markers: {
        visible: false,
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
        margin: getSpacing(3),
        padding: getSpacing(4),
        animation: {
            type: FADEIN,
            delay: INITIAL_ANIMATION_DURATION
        },
        position: AUTO
    },
    notes: {
        label: {}
    },
    highlight: {
        markers: {
            border: {
                color: WHITE,
                width: 2
            }
        },
        zIndex: HIGHLIGHT_ZINDEX
    },
    tooltip: {
        format: '{0} - {1}'
    }
};

export default RangeAreaPoint;
