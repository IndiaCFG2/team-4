import { Class } from '../common';

class AnimationFactory extends Class {

    constructor() {
        super();

        this._items = [];
    }

    register(name, type) {
        this._items.push({
            name: name,
            type: type
        });
    }

    create(element, options) {
        const items = this._items;
        let match;

        if (options && options.type) {
            const type = options.type.toLowerCase();
            for (let i = 0; i < items.length; i++) {
                if (items[i].name.toLowerCase() === type) {
                    match = items[i];
                    break;
                }
            }
        }

        if (match) {
            return new match.type(element, options);
        }
    }
}

AnimationFactory.current = new AnimationFactory();

export default AnimationFactory;
