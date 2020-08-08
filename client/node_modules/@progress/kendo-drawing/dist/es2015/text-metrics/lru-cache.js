import { Class } from '../common';

class LRUCache extends Class {
    constructor(size) {
        super();

        this._size = size;
        this._length = 0;
        this._map = {};
    }

    put(key, value) {
        const map = this._map;
        const entry = { key: key, value: value };

        map[key] = entry;

        if (!this._head) {
            this._head = this._tail = entry;
        } else {
            this._tail.newer = entry;
            entry.older = this._tail;
            this._tail = entry;
        }

        if (this._length >= this._size) {
            map[this._head.key] = null;
            this._head = this._head.newer;
            this._head.older = null;
        } else {
            this._length++;
        }
    }

    get(key) {
        const entry = this._map[key];

        if (entry) {
            if (entry === this._head && entry !== this._tail) {
                this._head = entry.newer;
                this._head.older = null;
            }

            if (entry !== this._tail) {
                if (entry.older) {
                    entry.older.newer = entry.newer;
                    entry.newer.older = entry.older;
                }

                entry.older = this._tail;
                entry.newer = null;

                this._tail.newer = entry;
                this._tail = entry;
            }

            return entry.value;
        }
    }
}

export default LRUCache;