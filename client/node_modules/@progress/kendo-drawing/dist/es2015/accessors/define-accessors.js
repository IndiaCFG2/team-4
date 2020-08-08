function setAccessor(field) {
    return function(value) {
        if (this[field] !== value) {
            this[field] = value;
            this.geometryChange();
        }

        return this;
    };
}

function getAccessor(field) {
    return function() {
        return this[field];
    };
}

export default function defineAccessors(fn, fields) {
    for (let i = 0; i < fields.length; i++) {
        let name = fields[i];
        let capitalized = name.charAt(0).toUpperCase() +
                          name.substring(1, name.length);

        fn["set" + capitalized] = setAccessor(name);
        fn["get" + capitalized] = getAccessor(name);
    }
}