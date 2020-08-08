import { ShapeElement } from '../../core';
import { deepExtend } from '../../common';
import PointEventsMixin from '../mixins/point-events-mixin';

var Target = (function (ShapeElement) {
	function Target () {
		ShapeElement.apply(this, arguments);
	}if ( ShapeElement ) Target.__proto__ = ShapeElement;
	Target.prototype = Object.create( ShapeElement && ShapeElement.prototype );
	Target.prototype.constructor = Target;

	

	return Target;
}(ShapeElement));

deepExtend(Target.prototype, PointEventsMixin);

export default Target;