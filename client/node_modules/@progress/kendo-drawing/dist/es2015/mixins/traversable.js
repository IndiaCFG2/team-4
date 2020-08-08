
const Traversable = {
    extend: function(proto, childrenField) {
        proto.traverse = function(callback) {
            const children = this[childrenField];

            for (let i = 0; i < children.length; i++) {
                let child = children[i];

                if (child.traverse) {
                    child.traverse(callback);
                } else {
                    callback(child);
                }
            }

            return this;
        };
    }
};

export default Traversable;