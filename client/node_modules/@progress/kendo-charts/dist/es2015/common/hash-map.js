
export default class HashMap {
    constructor() {
        this._map = {};
    }

    get(name) {
        return this._map[this._key(name)];
    }

    set(name, value) {
        this._map[this._key(name)] = value;
    }

    _key(name) {
        return name instanceof Date ? name.getTime() : name;
    }
}