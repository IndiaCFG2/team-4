import { drawing as draw } from '@progress/kendo-drawing';

import { BoxElement, FloatElement, ShapeElement, TextBox } from '../../core';
import { LEGEND_ITEM_CLICK, LEGEND_ITEM_HOVER, LEGEND_ITEM_LEAVE } from '../constants';
import { CENTER, WHITE } from '../../common/constants';
import { deepExtend, eventElement } from '../../common';

var LegendItem = (function (BoxElement) {
    function LegendItem(options) {
        BoxElement.call(this, options);

        this.createContainer();
        if (!options.rtl) {
            this.createMarker();
            this.createLabel();
        } else {
            this.createLabel();
            this.createMarker();
        }
    }

    if ( BoxElement ) LegendItem.__proto__ = BoxElement;
    LegendItem.prototype = Object.create( BoxElement && BoxElement.prototype );
    LegendItem.prototype.constructor = LegendItem;

    LegendItem.prototype.createContainer = function createContainer () {
        this.container = new FloatElement({ vertical: false, wrap: false, align: CENTER, spacing: this.options.spacing });
        this.append(this.container);
    };

    LegendItem.prototype.createMarker = function createMarker () {
        this.container.append(new ShapeElement(this.markerOptions()));
    };

    LegendItem.prototype.markerOptions = function markerOptions () {
        var options = this.options;
        var markerColor = options.markerColor;
        return deepExtend({}, options.markers, {
            background: markerColor,
            border: {
                color: markerColor
            }
        });
    };

    LegendItem.prototype.createLabel = function createLabel () {
        var options = this.options;
        var labelOptions = deepExtend({}, options.labels);

        this.container.append(new TextBox(options.text, labelOptions));
    };

    LegendItem.prototype.renderComplete = function renderComplete () {
        BoxElement.prototype.renderComplete.call(this);

        var cursor = this.options.cursor || {};
        var eventSink = this._itemOverlay = draw.Path.fromRect(this.container.box.toRect(), {
            fill: {
                color: WHITE,
                opacity: 0
            },
            stroke: null,
            cursor: cursor.style || cursor
        });

        this.appendVisual(eventSink);
    };

    LegendItem.prototype.click = function click (widget, e) {
        var args = this.eventArgs(e);

        if (!widget.trigger(LEGEND_ITEM_CLICK, args) && e && e.type === 'contextmenu') {
            e.preventDefault();
        }
    };

    LegendItem.prototype.over = function over (widget, e) {
        var args = this.eventArgs(e);

        if (!widget.trigger(LEGEND_ITEM_HOVER, args)) {
            widget._legendItemHover(args.seriesIndex, args.pointIndex);
        }

        // Don't trigger point hover for legend items
        return true;
    };

    LegendItem.prototype.out = function out (widget, e) {
        widget._unsetActivePoint();

        widget.trigger(LEGEND_ITEM_LEAVE, this.eventArgs(e));
    };

    LegendItem.prototype.eventArgs = function eventArgs (e) {
        var options = this.options;

        return {
            element: eventElement(e),
            text: options.text,
            series: options.series,
            seriesIndex: options.series.index,
            pointIndex: options.pointIndex
        };
    };

    LegendItem.prototype.renderVisual = function renderVisual () {
        var this$1 = this;

        var options = this.options;
        var customVisual = options.visual;

        if (customVisual) {
            this.visual = customVisual({
                active: options.active,
                series: options.series,
                sender: this.getSender(),
                pointIndex: options.pointIndex,
                options: {
                    markers: this.markerOptions(),
                    labels: options.labels
                },
                createVisual: function () {
                    this$1.createVisual();
                    this$1.renderChildren();
                    this$1.renderComplete();

                    var defaultVisual = this$1.visual;

                    delete this$1.visual;

                    return defaultVisual;
                }
            });
            this.addVisual();
        } else {
            BoxElement.prototype.renderVisual.call(this);
        }
    };

    return LegendItem;
}(BoxElement));

export default LegendItem;
