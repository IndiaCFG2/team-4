
var HashMap = function HashMap() {
    this._map = {};
};

HashMap.prototype.get = function get (name) {
    return this._map[this._key(name)];
};

HashMap.prototype.set = function set (name, value) {
    this._map[this._key(name)] = value;
};

HashMap.prototype._key = function _key (name) {
    return name instanceof Date ? name.getTime() : name;
};

export default HashMap;