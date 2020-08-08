import { DomEventsBuilder } from '../services';

import { DateCategoryAxis, Point } from '../core';

import { MOUSEWHEEL_DELAY, MOUSEWHEEL, SELECT_START, SELECT, SELECT_END } from './constants';

import { LEFT, RIGHT, MIN_VALUE, MAX_VALUE } from '../common/constants';
import { addClass, Class, removeClass, deepExtend, elementStyles, eventElement, setDefaultOptions, limitValue, round, bindEvents, unbindEvents, mousewheelDelta, hasClasses } from '../common';
import { parseDate } from '../date-utils';

var ZOOM_ACCELERATION = 3;
var SELECTOR_HEIGHT_ADJUST = 0.1;

function createDiv(className) {
    var element = document.createElement("div");
    if (className) {
        element.className = className;
    }

    return element;
}

function closestHandle(element) {
    var current = element;
    while (current && !hasClasses(current, "k-handle")) {
        current = current.parentNode;
    }

    return current;
}

var Selection = (function (Class) {
    function Selection(chart, categoryAxis, options, observer) {
        Class.call(this);

        var chartElement = chart.element;

        this.options = deepExtend({}, this.options, options);
        this.chart = chart;
        this.observer = observer;
        this.chartElement = chartElement;
        this.categoryAxis = categoryAxis;
        this._dateAxis = this.categoryAxis instanceof DateCategoryAxis;

        this.initOptions();

        this.visible = this.options.visible && chartElement.offsetHeight;

        if (this.visible) {
            this.createElements();

            this.set(this._index(this.options.from), this._index(this.options.to));

            this.bindEvents();
        }
    }

    if ( Class ) Selection.__proto__ = Class;
    Selection.prototype = Object.create( Class && Class.prototype );
    Selection.prototype.constructor = Selection;

    Selection.prototype.onPane = function onPane (pane) {
        return this.categoryAxis.pane === pane;
    };

    Selection.prototype.createElements = function createElements () {
        var options = this.options;
        var wrapper = this.wrapper = createDiv("k-selector");
        elementStyles(wrapper, {
            top: options.offset.top,
            left: options.offset.left,
            width: options.width,
            height: options.height,
            direction: 'ltr'
        });
        var selection = this.selection = createDiv("k-selection");
        this.leftMask = createDiv("k-mask");
        this.rightMask = createDiv("k-mask");

        wrapper.appendChild(this.leftMask);
        wrapper.appendChild(this.rightMask);
        wrapper.appendChild(selection);

        selection.appendChild(createDiv("k-selection-bg"));

        var leftHandle = this.leftHandle = createDiv("k-handle k-left-handle");
        var rightHandle = this.rightHandle = createDiv("k-handle k-right-handle");
        leftHandle.appendChild(createDiv());
        rightHandle.appendChild(createDiv());

        selection.appendChild(leftHandle);
        selection.appendChild(rightHandle);

        this.chartElement.appendChild(wrapper);
        var selectionStyles = elementStyles(selection, [ "borderLeftWidth", "borderRightWidth", "height" ]);
        var leftHandleHeight = elementStyles(leftHandle, "height").height;
        var rightHandleHeight = elementStyles(rightHandle, "height").height;

        options.selection = {
            border: {
                left: selectionStyles.borderLeftWidth,
                right: selectionStyles.borderRightWidth
            }
        };

        elementStyles(leftHandle, {
            top: (selectionStyles.height - leftHandleHeight) / 2
        });

        elementStyles(rightHandle, {
            top: (selectionStyles.height - rightHandleHeight) / 2
        });

        wrapper.style.cssText = wrapper.style.cssText;
    };

    Selection.prototype.bindEvents = function bindEvents$1 () {
        var obj;

        if (this.options.mousewheel !== false) {
            this._mousewheelHandler = this._mousewheel.bind(this);
            bindEvents(this.wrapper, ( obj = {}, obj[ MOUSEWHEEL ] = this._mousewheelHandler, obj ));
        }

        this._domEvents = DomEventsBuilder.create(this.wrapper, {
            stopPropagation: true, // applicable for the jQuery UserEvents
            start: this._start.bind(this),
            move: this._move.bind(this),
            end: this._end.bind(this),
            tap: this._tap.bind(this),
            press: this._press.bind(this),
            gesturestart: this._gesturestart.bind(this),
            gesturechange: this._gesturechange.bind(this),
            gestureend: this._gestureend.bind(this)
        });
    };

    Selection.prototype.initOptions = function initOptions () {
        var ref = this;
        var options = ref.options;
        var categoryAxis = ref.categoryAxis;
        var box = categoryAxis.pane.chartsBox();
        var intlService = this.chart.chartService.intl;

        if (this._dateAxis) {
            deepExtend(options, {
                min: parseDate(intlService, options.min),
                max: parseDate(intlService, options.max),
                from: parseDate(intlService, options.from),
                to: parseDate(intlService, options.to)
            });
        }

        var ref$1 = elementStyles(this.chartElement, [ "paddingLeft", "paddingTop" ]);
        var paddingLeft = ref$1.paddingLeft;
        var paddingTop = ref$1.paddingTop;

        this.options = deepExtend({}, {
            width: box.width(),
            height: box.height() + SELECTOR_HEIGHT_ADJUST, //workaround for sub-pixel hover on the paths in chrome
            padding: {
                left: paddingLeft,
                top: paddingTop
            },
            offset: {
                left: box.x1 + paddingLeft,
                top: box.y1 + paddingTop
            },
            from: options.min,
            to: options.max
        }, options);
    };

    Selection.prototype.destroy = function destroy () {
        var obj;

        if (this._domEvents) {
            this._domEvents.destroy();
            delete this._domEvents;
        }

        clearTimeout(this._mwTimeout);
        this._state = null;

        if (this.wrapper) {
            if (this._mousewheelHandler) {
                unbindEvents(this.wrapper, ( obj = {}, obj[ MOUSEWHEEL ] = this._mousewheelHandler, obj ));
                this._mousewheelHandler = null;
            }
            this.chartElement.removeChild(this.wrapper);
            this.wrapper = null;
        }
    };

    Selection.prototype._rangeEventArgs = function _rangeEventArgs (range) {

        return {
            axis: this.categoryAxis.options,
            from: this._value(range.from),
            to: this._value(range.to)
        };
    };

    Selection.prototype._start = function _start (e) {
        var options = this.options;
        var target = eventElement(e);

        if (this._state || !target) {
            return;
        }

        this.chart._unsetActivePoint();
        this._state = {
            moveTarget: closestHandle(target) || target,
            startLocation: e.x ? e.x.location : 0,
            range: {
                from: this._index(options.from),
                to: this._index(options.to)
            }
        };

        var args = this._rangeEventArgs({
            from: this._index(options.from),
            to: this._index(options.to)
        });

        if (this.trigger(SELECT_START, args)) {
            this._state = null;
        }
    };

    Selection.prototype._press = function _press (e) {
        var handle;
        if (this._state) {
            handle = this._state.moveTarget;
        } else {
            handle = closestHandle(eventElement(e));
        }
        if (handle) {
            addClass(handle, "k-handle-active");
        }
    };

    Selection.prototype._move = function _move (e) {
        if (!this._state) {
            return;
        }

        var ref = this;
        var state = ref._state;
        var options = ref.options;
        var categoryAxis = ref.categoryAxis;
        var range = state.range;
        var target = state.moveTarget;
        var reverse = categoryAxis.options.reverse;
        var from = this._index(options.from);
        var to = this._index(options.to);
        var min = this._index(options.min);
        var max = this._index(options.max);
        var delta = state.startLocation - e.x.location;
        var oldRange = { from: range.from, to: range.to };
        var span = range.to - range.from;
        var scale = elementStyles(this.wrapper, "width").width / (categoryAxis.categoriesCount() - 1);
        var offset = Math.round(delta / scale) * (reverse ? -1 : 1);

        if (!target) {
            return;
        }

        var leftHandle = hasClasses(target, "k-left-handle");
        var rightHandle = hasClasses(target, "k-right-handle");

        if (hasClasses(target, "k-selection k-selection-bg")) {
            range.from = Math.min(
                Math.max(min, from - offset),
                max - span
            );
            range.to = Math.min(
                range.from + span,
                max
            );
        } else if ((leftHandle && !reverse) || (rightHandle && reverse)) {
            range.from = Math.min(
                Math.max(min, from - offset),
                max - 1
            );
            range.to = Math.max(range.from + 1, range.to);
        } else if ((leftHandle && reverse) || (rightHandle && !reverse)) {
            range.to = Math.min(
                Math.max(min + 1, to - offset),
                max
            );
            range.from = Math.min(range.to - 1, range.from);
        }

        if (range.from !== oldRange.from || range.to !== oldRange.to) {
            this.move(range.from, range.to);
            this.trigger(SELECT, this._rangeEventArgs(range));
        }
    };

    Selection.prototype._end = function _end () {
        if (this._state) {
            var moveTarget = this._state.moveTarget;
            if (moveTarget) {
                removeClass(moveTarget, "k-handle-active");
            }

            var range = this._state.range;
            this.set(range.from, range.to);
            this.trigger(SELECT_END, this._rangeEventArgs(range));

            delete this._state;
        }
    };

    Selection.prototype._tap = function _tap (e) {
        var ref = this;
        var options = ref.options;
        var categoryAxis = ref.categoryAxis;
        var coords = this.chart._eventCoordinates(e);
        var categoryIx = categoryAxis.pointCategoryIndex(new Point(coords.x, categoryAxis.box.y1));
        var from = this._index(options.from);
        var to = this._index(options.to);
        var min = this._index(options.min);
        var max = this._index(options.max);
        var span = to - from;
        var mid = from + span / 2;
        var range = {};
        var rightClick = e.event.which === 3;
        var offset = Math.round(mid - categoryIx);

        if (this._state || rightClick) {
            return;
        }


        this.chart._unsetActivePoint();

        if (!categoryAxis.options.justified) {
            offset--;
        }

        range.from = Math.min(
            Math.max(min, from - offset),
            max - span
        );

        range.to = Math.min(range.from + span, max);

        this._start(e);
        if (this._state) {
            this._state.range = range;
            this.trigger(SELECT, this._rangeEventArgs(range));
            this._end();
        }
    };

    Selection.prototype._mousewheel = function _mousewheel (e) {
        var this$1 = this;

        var delta = mousewheelDelta(e);

        this._start({ target: this.selection });

        if (this._state) {
            var range = this._state.range;

            e.preventDefault();
            e.stopPropagation();

            if (Math.abs(delta) > 1) {
                delta *= ZOOM_ACCELERATION;
            }

            if (this.options.mousewheel.reverse) {
                delta *= -1;
            }

            if (this.expand(delta)) {
                this.trigger(SELECT, {
                    axis: this.categoryAxis.options,
                    delta: delta,
                    originalEvent: e,
                    from: this._value(range.from),
                    to: this._value(range.to)
                });
            }

            if (this._mwTimeout) {
                clearTimeout(this._mwTimeout);
            }

            this._mwTimeout = setTimeout(function () {
                this$1._end();
            }, MOUSEWHEEL_DELAY);
        }
    };

    Selection.prototype._gesturestart = function _gesturestart (e) {
        var options = this.options;

        this._state = {
            range: {
                from: this._index(options.from),
                to: this._index(options.to)
            }
        };
        var args = this._rangeEventArgs(this._state.range);

        if (this.trigger(SELECT_START, args)) {
            this._state = null;
        } else {
            e.preventDefault();
        }
    };

    Selection.prototype._gestureend = function _gestureend () {
        if (this._state) {
            this.trigger(SELECT_END, this._rangeEventArgs(this._state.range));
            delete this._state;
        }
    };

    Selection.prototype._gesturechange = function _gesturechange (e) {
        var ref = this;
        var chart = ref.chart;
        var state = ref._state;
        var options = ref.options;
        var categoryAxis = ref.categoryAxis;
        var range = state.range;
        var p0 = chart._toModelCoordinates(e.touches[0].x.location).x;
        var p1 = chart._toModelCoordinates(e.touches[1].x.location).x;
        var left = Math.min(p0, p1);
        var right = Math.max(p0, p1);

        e.preventDefault();

        range.from = categoryAxis.pointCategoryIndex(new Point(left)) || options.min;

        range.to = categoryAxis.pointCategoryIndex(new Point(right)) || options.max;

        this.move(range.from, range.to);

        this.trigger(SELECT, this._rangeEventArgs(range));
    };

    Selection.prototype._index = function _index (value) {
        var index = value;

        if (value instanceof Date) {
            index = this.categoryAxis.categoryIndex(value);
        }

        return index;
    };

    Selection.prototype._value = function _value (index) {
        var value = index;
        if (this._dateAxis) {
            value = this.categoryAxis.categoryAt(index);
            if (value > this.options.max) {
                value = this.options.max;
            }
        }

        return value;
    };

    Selection.prototype._slot = function _slot (value) {
        var categoryAxis = this.categoryAxis;
        var index = this._index(value);

        return categoryAxis.getSlot(index, index, true);
    };

    Selection.prototype.move = function move (from, to) {
        var options = this.options;
        var reverse = this.categoryAxis.options.reverse;
        var offset = options.offset;
        var padding = options.padding;
        var border = options.selection.border;
        var left = reverse ? to : from;
        var right = reverse ? from : to;
        var edge = 'x' + (reverse ? 2 : 1);

        var box = this._slot(left);
        var leftMaskWidth = round(box[edge] - offset.left + padding.left);

        elementStyles(this.leftMask, {
            width: leftMaskWidth
        });
        elementStyles(this.selection, {
            left: leftMaskWidth
        });

        box = this._slot(right);

        var rightMaskWidth = round(options.width - (box[edge] - offset.left + padding.left));
        elementStyles(this.rightMask, {
            width: rightMaskWidth
        });

        var distance = options.width - rightMaskWidth;
        if (distance !== options.width) {
            distance += border.right;
        }

        elementStyles(this.rightMask, {
            left: distance
        });
        elementStyles(this.selection, {
            width: Math.max(options.width - (leftMaskWidth + rightMaskWidth) - border.right, 0)
        });
    };

    Selection.prototype.set = function set (from, to) {
        var options = this.options;
        var min = this._index(options.min);
        var max = this._index(options.max);
        var fromValue = limitValue(this._index(from), min, max);
        var toValue = limitValue(this._index(to), fromValue + 1, max);

        if (options.visible) {
            this.move(fromValue, toValue);
        }

        options.from = this._value(fromValue);
        options.to = this._value(toValue);
    };

    Selection.prototype.expand = function expand (delta) {
        var options = this.options;
        var min = this._index(options.min);
        var max = this._index(options.max);
        var zDir = options.mousewheel.zoom;
        var from = this._index(options.from);
        var to = this._index(options.to);
        var range = { from: from, to: to };
        var oldRange = deepExtend({}, range);

        if (this._state) {
            range = this._state.range;
        }

        if (zDir !== RIGHT) {
            range.from = limitValue(
                limitValue(from - delta, 0, to - 1),
                min, max
            );
        }

        if (zDir !== LEFT) {
            range.to = limitValue(
                limitValue(to + delta, range.from + 1, max),
                min,
                max
             );
        }

        if (range.from !== oldRange.from || range.to !== oldRange.to) {
            this.set(range.from, range.to);
            return true;
        }
    };

    Selection.prototype.trigger = function trigger (name, args) {
        return (this.observer || this.chart).trigger(name, args);
    };

    return Selection;
}(Class));

setDefaultOptions(Selection, {
    visible: true,
    mousewheel: {
        zoom: "both"
    },
    min: MIN_VALUE,
    max: MAX_VALUE
});

export default Selection;
