import RadialGauge from '../radial/radial-gauge';
import ArcScale from './arc-scale';
import RangePointer from './range-pointer';

import { deepExtend } from '../../common';


class ArcGauge extends RadialGauge {

    _initTheme(theme) {
        super._initTheme(theme);

        this.options.color = this.options.color || (this.theme.pointer || {}).color;
    }

    _createModel() {
        const options = this.options;
        const scale = this.scale = new ArcScale(options.scale, this.contextService);

        const pointer = new RangePointer(scale, deepExtend({}, {
            colors: options.colors,
            color: options.color,
            value: options.value,
            opacity: options.opacity,
            animation: {
                transitions: options.transitions
            }
        }));

        this.pointers = [ pointer ];
    }

    _buildPointers(pointers) {
        for (let i = 0; i < pointers.length; i++) {
            const current = pointers[i];
            current.render();

            current.value(current.options.value);
        }
    }

    _setValueOptions(value) {
        this.options.value = value;
    }

    currentColor() {
        const pointer = this.pointers[0];
        if (pointer) {
            return pointer.currentColor();
        }
    }

    centerLabelPosition(width, height) {
        const size = this.getSize();
        const center = this.scale.arc.center;

        let left = center.x - width / 2;
        let top = center.y - height / 2;

        if (width < size.width) {
            const right = left + width;

            left = Math.max(left, 0);

            if (right > size.width) {
                left -= right - size.width;
            }
        }

        if (height < size.height) {
            const bbox = this.scale.bbox;
            const yLimit = bbox.bottomRight().y;
            const bottom = top + height;

            top = Math.max(top, bbox.origin.y);

            if (bottom > yLimit) {
                top -= bottom - yLimit;
            }
        }

        return {
            left: left,
            top: top
        };
    }
}

export default ArcGauge;