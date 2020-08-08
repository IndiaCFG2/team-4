import { ShapeElement } from '../../core';
import { deepExtend } from '../../common';
import PointEventsMixin from '../mixins/point-events-mixin';

class Target extends ShapeElement { }

deepExtend(Target.prototype, PointEventsMixin);

export default Target;