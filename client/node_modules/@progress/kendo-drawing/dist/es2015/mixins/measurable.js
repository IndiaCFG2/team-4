import Matrix from '../geometry/matrix';
import toMatrix from '../geometry/to-matrix';

const IDENTITY_MATRIX_HASH = Matrix.IDENTITY.toString();

const Measurable = {
    extend: function(proto) {
        proto.bbox = this.bbox;
        proto.geometryChange = this.geometryChange;
    },

    bbox: function(transformation) {
        const combinedMatrix = toMatrix(this.currentTransform(transformation));
        const matrixHash = combinedMatrix ? combinedMatrix.toString() : IDENTITY_MATRIX_HASH;
        let bbox;

        if (this._bboxCache && this._matrixHash === matrixHash) {
            bbox = this._bboxCache.clone();
        } else {
            bbox = this._bbox(combinedMatrix);
            this._bboxCache = bbox ? bbox.clone() : null;
            this._matrixHash = matrixHash;
        }

        const strokeWidth = this.options.get("stroke.width");
        if (strokeWidth && bbox) {
            bbox.expand(strokeWidth / 2);
        }

        return bbox;
    },

    geometryChange: function() {
        delete this._bboxCache;
        this.trigger("geometryChange", {
            element: this
        });
    }
};

export default Measurable;