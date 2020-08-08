import definePointAccessors from '../accessors/define-point-accessors';
import Point from '../geometry/point';
import Gradient from './gradient';

class LinearGradient extends Gradient {
    constructor(options = {}) {
        super(options);

        this.start(options.start || new Point());

        this.end(options.end || new Point(1, 0));
    }
}

definePointAccessors(LinearGradient.prototype, [ "start", "end" ]);

export default LinearGradient;