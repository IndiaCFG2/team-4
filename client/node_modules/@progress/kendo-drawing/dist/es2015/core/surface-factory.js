import { Class, logToConsole } from '../common';

class SurfaceFactory extends Class {
    constructor() {
        super();

        this._items = [];
    }

    register(name, type, order) {
        const items = this._items;
        const first = items[0];
        const entry = {
            name: name,
            type: type,
            order: order
        };

        if (!first || order < first.order) {
            items.unshift(entry);
        } else {
            items.push(entry);
        }
    }

    create(element, options) {
        const items = this._items;
        let match = items[0];

        if (options && options.type) {
            const preferred = options.type.toLowerCase();
            for (let i = 0; i < items.length; i++) {
                if (items[i].name === preferred) {
                    match = items[i];
                    break;
                }
            }
        }

        if (match) {
            return new match.type(element, options);
        }

        logToConsole(
            "Warning: Unable to create Kendo UI Drawing Surface. Possible causes:\n" +
            `- The browser does not support SVG and Canvas. User agent: ${ navigator.userAgent }`);
    }
}

SurfaceFactory.current = new SurfaceFactory();

export default SurfaceFactory;