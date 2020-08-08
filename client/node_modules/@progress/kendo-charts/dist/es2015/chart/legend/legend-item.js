import { drawing as draw } from '@progress/kendo-drawing';

import { BoxElement, FloatElement, ShapeElement, TextBox } from '../../core';
import { LEGEND_ITEM_CLICK, LEGEND_ITEM_HOVER, LEGEND_ITEM_LEAVE } from '../constants';
import { CENTER, WHITE } from '../../common/constants';
import { deepExtend, eventElement } from '../../common';

class LegendItem extends BoxElement {
    constructor(options) {
        super(options);

        this.createContainer();
        if (!options.rtl) {
            this.createMarker();
            this.createLabel();
        } else {
            this.createLabel();
            this.createMarker();
        }
    }

    createContainer() {
        this.container = new FloatElement({ vertical: false, wrap: false, align: CENTER, spacing: this.options.spacing });
        this.append(this.container);
    }

    createMarker() {
        this.container.append(new ShapeElement(this.markerOptions()));
    }

    markerOptions() {
        const options = this.options;
        const markerColor = options.markerColor;
        return deepExtend({}, options.markers, {
            background: markerColor,
            border: {
                color: markerColor
            }
        });
    }

    createLabel() {
        const options = this.options;
        const labelOptions = deepExtend({}, options.labels);

        this.container.append(new TextBox(options.text, labelOptions));
    }

    renderComplete() {
        super.renderComplete();

        const cursor = this.options.cursor || {};
        const eventSink = this._itemOverlay = draw.Path.fromRect(this.container.box.toRect(), {
            fill: {
                color: WHITE,
                opacity: 0
            },
            stroke: null,
            cursor: cursor.style || cursor
        });

        this.appendVisual(eventSink);
    }

    click(widget, e) {
        const args = this.eventArgs(e);

        if (!widget.trigger(LEGEND_ITEM_CLICK, args) && e && e.type === 'contextmenu') {
            e.preventDefault();
        }
    }

    over(widget, e) {
        const args = this.eventArgs(e);

        if (!widget.trigger(LEGEND_ITEM_HOVER, args)) {
            widget._legendItemHover(args.seriesIndex, args.pointIndex);
        }

        // Don't trigger point hover for legend items
        return true;
    }

    out(widget, e) {
        widget._unsetActivePoint();

        widget.trigger(LEGEND_ITEM_LEAVE, this.eventArgs(e));
    }

    eventArgs(e) {
        const options = this.options;

        return {
            element: eventElement(e),
            text: options.text,
            series: options.series,
            seriesIndex: options.series.index,
            pointIndex: options.pointIndex
        };
    }

    renderVisual() {
        const options = this.options;
        const customVisual = options.visual;

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
                createVisual: () => {
                    this.createVisual();
                    this.renderChildren();
                    this.renderComplete();

                    const defaultVisual = this.visual;

                    delete this.visual;

                    return defaultVisual;
                }
            });
            this.addVisual();
        } else {
            super.renderVisual();
        }
    }
}

export default LegendItem;
