import { geometry as geo, drawing } from '@progress/kendo-drawing';
import { setDefaultOptions, deepExtend, round, isArray } from '../../common';
import { COORD_PRECISION } from '../../common/constants';
import Gauge from '../gauge';
import RadialScale from './radial-scale';
import RadialPointer from './radial-pointer';

const Group = drawing.Group;

class RadialGauge extends Gauge {

    reflow(bbox) {
        const pointers = this.pointers;
        this.scale.reflow(bbox);
        this._initialPlotArea = this.scale.bbox;

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow(this.scale.arc);
            this._initialPlotArea = geo.Rect.union(this._initialPlotArea, pointers[i].bbox);
        }

        this.fitScale(bbox);
        this.alignScale(bbox);
        this._buildVisual(this.gaugeArea, pointers, this.scale);
        this._draw();
    }

    _buildVisual(gaugeArea, pointers, scale) {
        const visuals = this._visuals = new Group();

        visuals.append(gaugeArea);
        visuals.append(scale.ticks);
        visuals.append(scale.ranges);
        this._buildPointers(pointers);
        visuals.append(scale.labelElements);
    }

    _buildPointers(pointers) {
        for (let i = 0; i < pointers.length; i++) {
            const current = pointers[i];
            current.render();
            this._visuals.append(current.elements);

            current.value(current.options.value);
        }
    }

    fitScale(bbox) {
        const arc = this.scale.arc;
        const plotAreaBox = this._initialPlotArea;
        const step = Math.abs(this.getDiff(plotAreaBox, bbox));
        let min = round(step, COORD_PRECISION);
        let max = round(-step, COORD_PRECISION);
        let minDiff, midDiff, maxDiff, mid, oldDiff;
        let staleFlag = 0;
        let i = 0;

        while (i++ < 100) {
            staleFlag = (oldDiff === maxDiff) ? (staleFlag + 1) : 0;

            if (staleFlag > 5) {
                break;
            }

            if (min !== mid) {
                minDiff = this.getPlotBox(min, bbox, arc);
                if (0 <= minDiff && minDiff <= 2) {
                    break;
                }
            }

            if (max !== mid) {
                maxDiff = this.getPlotBox(max, bbox, arc);
                if (0 <= maxDiff && maxDiff <= 2) {
                    break;
                }
            }

            if (minDiff > 0 && maxDiff > 0) {
                mid = min * 2;
            } else if (minDiff < 0 && maxDiff < 0) {
                mid = max * 2;
            } else {
                mid = round(((min + max) / 2) || 1, COORD_PRECISION);
            }

            midDiff = this.getPlotBox(mid, bbox, arc);
            if (0 <= midDiff && midDiff <= 2) {
                break;
            }

            oldDiff = maxDiff;

            if (midDiff > 0) {
                max = mid;
                maxDiff = midDiff;
            } else {
                min = mid;
                minDiff = midDiff;
            }
        }
    }

    getPlotBox(step, bbox, arc) {
        const scale = this.scale;
        const pointers = this.pointers;
        const radius = arc.getRadiusX();
        const scaleArc = arc.clone();

        scaleArc.setRadiusX(radius + step).setRadiusY(radius + step);

        scale.arc = scaleArc;
        scale.reflow(bbox);
        this.plotBbox = scale.bbox;

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow(scaleArc);
            this.plotBbox = geo.Rect.union(this.plotBbox, pointers[i].bbox);
        }

        return this.getDiff(this.plotBbox, bbox);
    }

    getDiff(plotBox, box) {
        return Math.min(box.width() - plotBox.width(), box.height() - plotBox.height());
    }

    alignScale(bbox) {
        const plotBoxCenter = this.plotBbox.center();
        const boxCenter = bbox.center();
        const paddingX = plotBoxCenter.x - boxCenter.x;
        const paddingY = plotBoxCenter.y - boxCenter.y;
        const { scale, pointers } = this;

        scale.arc.center.x -= paddingX;
        scale.arc.center.y -= paddingY;

        scale.reflow(bbox);

        for (let i = 0; i < pointers.length; i++) {
            pointers[i].reflow(scale.arc);
            this.plotBbox = geo.Rect.union(scale.bbox, pointers[i].bbox);
        }
    }

    _createModel() {
        const options = this.options;
        const pointers = options.pointer;
        const scale = this.scale = new RadialScale(options.scale, this.contextService);

        this.pointers = [];

        const pointersArr = isArray(pointers) ? pointers : [ pointers ];
        for (let i = 0; i < pointersArr.length; i++) {
            const current = new RadialPointer(scale, deepExtend({}, pointersArr[i], {
                animation: {
                    transitions: options.transitions
                }
            }));

            this.pointers.push(current);
        }
    }
}

setDefaultOptions(RadialGauge, {
    transitions: true,
    gaugeArea: {
        background: ""
    }
});

export default RadialGauge;