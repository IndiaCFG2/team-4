import Node from './node';
import { parseColor } from '../common';
import { isTransparent, valueOrDefault } from '../util';
import LinearGradient from '../gradients/linear-gradient';
import RadialGradient from '../gradients/radial-gradient';
import { DASH_ARRAYS, SOLID, BUTT } from '../core/constants';
import renderPath from './utils/render-path';
import NODE_MAP from './node-map';

function addGradientStops(gradient, stops) {
    for (let idx = 0; idx < stops.length; idx++) {
        let stop = stops[idx];
        let color = parseColor(stop.color());

        color.a *= stop.opacity();

        gradient.addColorStop(stop.offset(), color.toCssRgba());
    }
}

class PathNode extends Node {

    renderTo(ctx) {
        ctx.save();

        this.setTransform(ctx);
        this.setClip(ctx);
        this.setOpacity(ctx);

        ctx.beginPath();

        this.renderPoints(ctx, this.srcElement);

        this.setLineDash(ctx);
        this.setLineCap(ctx);
        this.setLineJoin(ctx);

        this.setFill(ctx);
        this.setStroke(ctx);

        ctx.restore();
    }

    setFill(ctx) {
        const fill = this.srcElement.options.fill;
        let hasFill = false;

        if (fill) {
            if (fill.nodeType === "Gradient") {
                this.setGradientFill(ctx, fill);
                hasFill = true;
            } else if (!isTransparent(fill.color)) {
                ctx.fillStyle = fill.color;

                ctx.save();
                this.globalAlpha(ctx, fill.opacity);
                ctx.fill();
                ctx.restore();

                hasFill = true;
            }
        }

        return hasFill;
    }

    setGradientFill(ctx, fill) {
        const bbox = this.srcElement.rawBBox();
        let gradient;

        if (fill instanceof LinearGradient) {
            let start = fill.start();
            let end = fill.end();
            gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        } else if (fill instanceof RadialGradient) {
            let center = fill.center();
            gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, fill.radius());
        }

        addGradientStops(gradient, fill.stops);

        ctx.save();

        if (!fill.userSpace()) {
            ctx.transform(bbox.width(), 0, 0, bbox.height(), bbox.origin.x, bbox.origin.y);
        }
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.restore();
    }

    setStroke(ctx) {
        const stroke = this.srcElement.options.stroke;
        if (stroke && !isTransparent(stroke.color) && stroke.width > 0) {
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = valueOrDefault(stroke.width, 1);

            ctx.save();
            this.globalAlpha(ctx, stroke.opacity);
            ctx.stroke();
            ctx.restore();

            return true;
        }
    }

    dashType() {
        const stroke = this.srcElement.options.stroke;
        if (stroke && stroke.dashType) {
            return stroke.dashType.toLowerCase();
        }
    }

    setLineDash(ctx) {
        const dashType = this.dashType();
        if (dashType && dashType !== SOLID) {
            const dashArray = DASH_ARRAYS[dashType];
            if (ctx.setLineDash) {
                ctx.setLineDash(dashArray);
            } else {
                ctx.mozDash = dashArray;
                ctx.webkitLineDash = dashArray;
            }
        }
    }

    setLineCap(ctx) {
        const dashType = this.dashType();
        const stroke = this.srcElement.options.stroke;
        if (dashType && dashType !== SOLID) {
            ctx.lineCap = BUTT;
        } else if (stroke && stroke.lineCap) {
            ctx.lineCap = stroke.lineCap;
        }
    }

    setLineJoin(ctx) {
        const stroke = this.srcElement.options.stroke;
        if (stroke && stroke.lineJoin) {
            ctx.lineJoin = stroke.lineJoin;
        }
    }

    renderPoints(ctx, path) {
        renderPath(ctx, path);
    }
}

NODE_MAP.Path = PathNode;

export default PathNode;
