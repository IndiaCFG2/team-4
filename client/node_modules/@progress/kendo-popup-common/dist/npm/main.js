'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var alignPoint = {
    "bottom": "bottom",
    "center": "center",
    "middle": "middle",
    "left": "left",
    "right": "right",
    "top": "top"
};

var align = function (options) {
    var anchorRect = options.anchorRect;
    var anchorAlign = options.anchorAlign;
    var elementRect = options.elementRect;
    var elementAlign = options.elementAlign;
    var margin = options.margin; if ( margin === void 0 ) margin = {};
    var anchorHorizontal = anchorAlign.horizontal;
    var anchorVertical = anchorAlign.vertical;
    var elementHorizontal = elementAlign.horizontal;
    var elementVertical = elementAlign.vertical;

    var horizontalMargin = margin.horizontal || 0;
    var verticalMargin = margin.vertical || 0;

    var top = anchorRect.top;
    var left = anchorRect.left;

    if (anchorVertical === alignPoint.bottom) {
        top += anchorRect.height;
    }

    if (anchorVertical === alignPoint.center || anchorVertical === alignPoint.middle) {
        top += Math.round(anchorRect.height / 2);
    }

    if (elementVertical === alignPoint.bottom) {
        top -= elementRect.height;
        verticalMargin *= -1;
    }

    if (elementVertical === alignPoint.center || elementVertical === alignPoint.middle) {
        top -= Math.round(elementRect.height / 2);
        verticalMargin *= -1;
    }

    if (anchorHorizontal === alignPoint.right) {
        left += anchorRect.width;
    }

    if (anchorHorizontal === alignPoint.center || anchorHorizontal === alignPoint.middle) {
        left += Math.round(anchorRect.width / 2);
    }

    if (elementHorizontal === alignPoint.right) {
        left -= elementRect.width;
        horizontalMargin *= -1;
    }

    if (elementHorizontal === alignPoint.center || elementHorizontal === alignPoint.middle) {
        left -= Math.round(elementRect.width / 2);
        horizontalMargin *= -1;
    }

    return {
        top: top + verticalMargin,
        left: left + horizontalMargin
    };
};

function addScroll(rect, scroll) {
    return {
        top: rect.top + scroll.y,
        left: rect.left + scroll.x,
        height: rect.height,
        width: rect.width
    };
}

function applyLocationOffset(rect, location, isOffsetBody) {
    var top = rect.top;
    var left = rect.left;

    if (isOffsetBody) {
        left = 0;
        top = 0;
    }

    return {
        top: top + location.top,
        left: left + location.left,
        height: rect.height,
        width: rect.width
    };
}

function ownerDocument(element) {
    return element.ownerDocument || element.document || element;
}

var getWindow = function (element) { return ownerDocument(element).defaultView; };

var getDocument = function (element) { return ownerDocument(element).documentElement; };

var cachedWidth = 0;

function scrollbarWidth() {
    if (!cachedWidth && typeof document !== 'undefined') {
        var div = document.createElement("div");

        div.style.cssText = "overflow:scroll;overflow-x:hidden;zoom:1;clear:both;display:block";
        div.innerHTML = "&nbsp;";
        document.body.appendChild(div);

        cachedWidth = div.offsetWidth - div.scrollWidth;

        document.body.removeChild(div);
    }

    return cachedWidth;
}

function windowViewport(element) {
    var win = getWindow(element);
    var document = getDocument(element);
    var result = {
        height: win.innerHeight,
        width: win.innerWidth
    };

    if (document.scrollHeight - document.clientHeight > 0) {
        result.width -= scrollbarWidth();
    }

    return result;
}

var boundingOffset = function (element) {
    if (!element.getBoundingClientRect) {
        var viewport = windowViewport(element);
        return {
            bottom: viewport.height,
            left: 0,
            right: viewport.width,
            top: 0
        };
    }

    var ref = element.getBoundingClientRect();
    var bottom = ref.bottom;
    var left = ref.left;
    var right = ref.right;
    var top = ref.top;

    return {
        bottom: bottom,
        left: left,
        right: right,
        top: top
    };
};

var offsetParent = function (element) {
    var offsetParent = element.offsetParent;

    while (offsetParent && offsetParent.style.position === "static") {
        offsetParent = offsetParent.offsetParent;
    }

    return offsetParent || getDocument(element);
};

var isBodyOffset = function (element) { return (offsetParent(element) === element.ownerDocument.body); };

var rectOfHiddenElement = function (element) {
    var ref = element.style;
    var display = ref.display;
    var left = ref.left;
    var position = ref.position;

    element.style.display = '';
    element.style.left = '-10000px';
    element.style.position = 'absolute';

    var rect = element.getBoundingClientRect();

    element.style.display = display;
    element.style.left = left;
    element.style.position = position;

    return rect;
};

var offset = function (element) {
    var rect = element.getBoundingClientRect();
    var left = rect.left;
    var top = rect.top;

    if (!rect.height && !rect.width) {
        rect = rectOfHiddenElement(element);
    }

    return {
        top: top,
        left: left,
        height: rect.height,
        width: rect.width
    };
};

var parents = function (element, until) {
    var result = [];
    var next = element.parentNode;

    while (next) {
        result.push(next);

        if (next === until) { break; }

        next = next.parentNode;
    }

    return result;
};

function scrollPosition(element) {
    var documentElement = getDocument(element);
    var win = getWindow(element);

    return {
        x: win.pageXOffset || documentElement.scrollLeft || 0,
        y: win.pageYOffset || documentElement.scrollTop || 0
    };
}

var elementScrollPosition = function (element) {
    if (element === (element.ownerDocument || {}).body) {
        return scrollPosition(element);
    }

    return {
        x: element.scrollLeft,
        y: element.scrollTop
    };
};

function parentScrollPosition(element) {
    var parent = offsetParent(element);

    return parent ? elementScrollPosition(parent) : { x: 0, y: 0 };
}

var position = function (element, parent) {
    var win = getWindow(element);
    var elementStyles = win.getComputedStyle(element);
    var offset$$1 = offset(element);
    var parentElement = parent || offsetParent(element);

    var ownerDocument = element.ownerDocument;
    var useRelative = parentElement !== ownerDocument.body && parentElement !== ownerDocument.documentElement;

    var parentOffset = { top: 0, left: 0 };

    if (elementStyles.position !== "fixed" && useRelative) {
        var parentStyles = win.getComputedStyle(parentElement);

        parentOffset = offset(parentElement);
        parentOffset.top += parseInt(parentStyles.borderTopWidth, 10);
        parentOffset.left += parseInt(parentStyles.borderLeftWidth, 10);
    }

    return {
        top: offset$$1.top - parentOffset.top,
        left: offset$$1.left - parentOffset.left,
        height: offset$$1.height,
        width: offset$$1.width
    };
};

var offsetParentScrollPosition = function (offsetParentElement, element) { return ( // eslint-disable-line no-arrow-condition
    offsetParentElement ? elementScrollPosition(offsetParentElement) : parentScrollPosition(element)
); };

var positionWithScroll = function (element, parent, scale) {
    if ( scale === void 0 ) scale = 1;

    var offsetParentElement = parent ? offsetParent(parent) : null;
    var ref = position(element, offsetParentElement);
    var top = ref.top;
    var left = ref.left;
    var height = ref.height;
    var width = ref.width;
    var ref$1 = offsetParentScrollPosition(offsetParentElement, element);
    var x = ref$1.x;
    var y = ref$1.y;
    var ownerDocument = element.ownerDocument;
    var positionScale = offsetParentElement === ownerDocument.body || offsetParentElement === ownerDocument.documentElement ? 1 : scale;

    return {
        top: top + y * positionScale,
        left: left + x * positionScale,
        height: height,
        width: width
    };
};

function removeScroll(rect, scroll) {
    return {
        top: rect.top - scroll.y,
        left: rect.left - scroll.x,
        height: rect.height,
        width: rect.width
    };
}

var collision = {
    "fit": "fit",
    "flip": "flip"
};

var fit = function(position, size, viewPortSize) {
    var output = 0;

    if (position + size > viewPortSize) {
        output = viewPortSize - (position + size);
    }

    if (position < 0) {
        output = -position;
    }

    return output;
};

var flip = function(ref) {
    var offset = ref.offset;
    var size = ref.size;
    var anchorSize = ref.anchorSize;
    var viewPortSize = ref.viewPortSize;
    var anchorAlignPoint = ref.anchorAlignPoint;
    var elementAlignPoint = ref.elementAlignPoint;
    var margin = ref.margin;

    var output = 0;

    var isPositionCentered = elementAlignPoint === alignPoint.center || elementAlignPoint === alignPoint.middle;
    var isOriginCentered = anchorAlignPoint === alignPoint.center || anchorAlignPoint === alignPoint.middle;
    var marginToAdd = 2 * margin; //2x to keep margin after flip

    if (elementAlignPoint !== anchorAlignPoint && !isPositionCentered && !isOriginCentered) {
        var isBeforeAnchor = anchorAlignPoint === alignPoint.top || anchorAlignPoint === alignPoint.left;
        if (offset < 0 && isBeforeAnchor) {
            output = size + anchorSize + marginToAdd;
            if (offset + output + size > viewPortSize) {
                output = 0; //skip flip
            }
        } else if (offset >= 0 && !isBeforeAnchor) {
            if (offset + size > viewPortSize) {
                output += -(anchorSize + size + marginToAdd);
            }

            if (offset + output < 0) {
                output = 0; //skip flip
            }
        }
    }

    return output;
};

var restrictToView = function (options) {
    var anchorRect = options.anchorRect;
    var anchorAlign = options.anchorAlign;
    var elementRect = options.elementRect;
    var elementAlign = options.elementAlign;
    var collisions = options.collisions;
    var viewPort = options.viewPort;
    var margin = options.margin; if ( margin === void 0 ) margin = {};
    var elementTop = elementRect.top;
    var elementLeft = elementRect.left;
    var elementHeight = elementRect.height;
    var elementWidth = elementRect.width;
    var viewPortHeight = viewPort.height;
    var viewPortWidth = viewPort.width;
    var horizontalMargin = margin.horizontal || 0;
    var verticalMargin = margin.vertical || 0;

    var left = 0;
    var top = 0;

    var isHorizontalFlip = collisions.horizontal === collision.flip;
    var isVerticalFlip = collisions.vertical === collision.flip;

    if (collisions.vertical === collision.fit) {
        top += fit(elementTop, elementHeight, viewPortHeight);
    }

    if (collisions.horizontal === collision.fit) {
        left += fit(elementLeft, elementWidth, viewPortWidth);
    }

    if (isVerticalFlip) {
        top += flip({
            margin: verticalMargin,
            offset: elementTop,
            size: elementHeight,
            anchorSize: anchorRect.height,
            viewPortSize: viewPortHeight,
            anchorAlignPoint: anchorAlign.vertical,
            elementAlignPoint: elementAlign.vertical
        });
    }

    if (isHorizontalFlip) {
        left += flip({
            margin: horizontalMargin,
            offset: elementLeft,
            size: elementWidth,
            anchorSize: anchorRect.width,
            viewPortSize: viewPortWidth,
            anchorAlignPoint: anchorAlign.horizontal,
            elementAlignPoint: elementAlign.horizontal
        });
    }
    var flippedHorizontal = isHorizontalFlip && left !== 0;
    var flippedVertical = isVerticalFlip && top !== 0;

    return {
        flipped: flippedHorizontal || flippedVertical,
        flip: {
            horizontal: flippedHorizontal,
            vertical: flippedVertical
        },
        offset: {
            left: left,
            top: top
        }
    };
};

var siblings = function (element) {
    var result = [];

    var sibling = element.parentNode.firstElementChild;

    while (sibling) {
        if (sibling !== element) {
            result.push(sibling);
        }

        sibling = sibling.nextElementSibling;
    }
    return result;
};

/* eslint-disable no-loop-func */

var siblingContainer = function (anchor, container) {
    var parentElements = parents(anchor);
    var containerElement = container;
    var siblingElements;
    var result;

    while (containerElement) {
        siblingElements = siblings(containerElement);

        result = parentElements.reduce(
            function (list, p) { return list.concat(siblingElements.filter(function (s) { return s === p; })); },
            []
        )[0];

        if (result) { break; }

        containerElement = containerElement.parentElement;
    }

    return result;
};

exports.align = align;
exports.addScroll = addScroll;
exports.applyLocationOffset = applyLocationOffset;
exports.boundingOffset = boundingOffset;
exports.isBodyOffset = isBodyOffset;
exports.offsetParent = offsetParent;
exports.offset = offset;
exports.parents = parents;
exports.parentScrollPosition = parentScrollPosition;
exports.position = position;
exports.positionWithScroll = positionWithScroll;
exports.removeScroll = removeScroll;
exports.restrictToView = restrictToView;
exports.scrollPosition = scrollPosition;
exports.siblingContainer = siblingContainer;
exports.siblings = siblings;
exports.getDocumentElement = getDocument;
exports.getWindow = getWindow;
exports.getWindowViewPort = windowViewport;
exports.AlignPoint = alignPoint;
exports.Collision = collision;

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL2FsaWduLXBvaW50LmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvYWxpZ24uanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9hZGQtc2Nyb2xsLmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvYXBwbHktbG9jYXRpb24tb2Zmc2V0LmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvb3duZXItZG9jdW1lbnQuanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy93aW5kb3cuanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9kb2N1bWVudC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL3Njcm9sbGJhci13aWR0aC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL3dpbmRvdy12aWV3cG9ydC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL2JvdW5kaW5nLW9mZnNldC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL29mZnNldC1wYXJlbnQuanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9pcy1ib2R5LW9mZnNldC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL29mZnNldC5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL3BhcmVudHMuanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9zY3JvbGwtcG9zaXRpb24uanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9lbGVtZW50LXNjcm9sbC1wb3NpdGlvbi5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL3BhcmVudC1zY3JvbGwtcG9zaXRpb24uanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9wb3NpdGlvbi5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL29mZnNldC1wYXJlbnQtc2Nyb2xsLXBvc2l0aW9uLmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvcG9zaXRpb24td2l0aC1zY3JvbGwuanMiLCIvdXNyL2xvY2FsL2plbmtpbnMvd29ya3NwYWNlL2tlbmRvLXBvcHVwLWNvbW1vbl9yZWxlYXNlL3NyYy9yZW1vdmUtc2Nyb2xsLmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvY29sbGlzaW9uLmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvcmVzdHJpY3QtdG8tdmlldy5qcyIsIi91c3IvbG9jYWwvamVua2lucy93b3Jrc3BhY2Uva2VuZG8tcG9wdXAtY29tbW9uX3JlbGVhc2Uvc3JjL3NpYmxpbmdzLmpzIiwiL3Vzci9sb2NhbC9qZW5raW5zL3dvcmtzcGFjZS9rZW5kby1wb3B1cC1jb21tb25fcmVsZWFzZS9zcmMvc2libGluZy1jb250YWluZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQge1xuICAgIFwiYm90dG9tXCI6IFwiYm90dG9tXCIsXG4gICAgXCJjZW50ZXJcIjogXCJjZW50ZXJcIixcbiAgICBcIm1pZGRsZVwiOiBcIm1pZGRsZVwiLFxuICAgIFwibGVmdFwiOiBcImxlZnRcIixcbiAgICBcInJpZ2h0XCI6IFwicmlnaHRcIixcbiAgICBcInRvcFwiOiBcInRvcFwiXG59O1xuIiwiaW1wb3J0IHBvaW50IGZyb20gJy4vYWxpZ24tcG9pbnQnO1xuXG5jb25zdCBhbGlnbiA9IChvcHRpb25zKSA9PiB7XG4gICAgY29uc3QgeyBhbmNob3JSZWN0LCBhbmNob3JBbGlnbiwgZWxlbWVudFJlY3QsIGVsZW1lbnRBbGlnbiwgbWFyZ2luID0ge30gfSA9IG9wdGlvbnM7XG4gICAgY29uc3QgYW5jaG9ySG9yaXpvbnRhbCA9IGFuY2hvckFsaWduLmhvcml6b250YWw7XG4gICAgY29uc3QgYW5jaG9yVmVydGljYWwgPSBhbmNob3JBbGlnbi52ZXJ0aWNhbDtcbiAgICBjb25zdCBlbGVtZW50SG9yaXpvbnRhbCA9IGVsZW1lbnRBbGlnbi5ob3Jpem9udGFsO1xuICAgIGNvbnN0IGVsZW1lbnRWZXJ0aWNhbCA9IGVsZW1lbnRBbGlnbi52ZXJ0aWNhbDtcblxuICAgIGxldCBob3Jpem9udGFsTWFyZ2luID0gbWFyZ2luLmhvcml6b250YWwgfHwgMDtcbiAgICBsZXQgdmVydGljYWxNYXJnaW4gPSBtYXJnaW4udmVydGljYWwgfHwgMDtcblxuICAgIGxldCB0b3AgPSBhbmNob3JSZWN0LnRvcDtcbiAgICBsZXQgbGVmdCA9IGFuY2hvclJlY3QubGVmdDtcblxuICAgIGlmIChhbmNob3JWZXJ0aWNhbCA9PT0gcG9pbnQuYm90dG9tKSB7XG4gICAgICAgIHRvcCArPSBhbmNob3JSZWN0LmhlaWdodDtcbiAgICB9XG5cbiAgICBpZiAoYW5jaG9yVmVydGljYWwgPT09IHBvaW50LmNlbnRlciB8fCBhbmNob3JWZXJ0aWNhbCA9PT0gcG9pbnQubWlkZGxlKSB7XG4gICAgICAgIHRvcCArPSBNYXRoLnJvdW5kKGFuY2hvclJlY3QuaGVpZ2h0IC8gMik7XG4gICAgfVxuXG4gICAgaWYgKGVsZW1lbnRWZXJ0aWNhbCA9PT0gcG9pbnQuYm90dG9tKSB7XG4gICAgICAgIHRvcCAtPSBlbGVtZW50UmVjdC5oZWlnaHQ7XG4gICAgICAgIHZlcnRpY2FsTWFyZ2luICo9IC0xO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50VmVydGljYWwgPT09IHBvaW50LmNlbnRlciB8fCBlbGVtZW50VmVydGljYWwgPT09IHBvaW50Lm1pZGRsZSkge1xuICAgICAgICB0b3AgLT0gTWF0aC5yb3VuZChlbGVtZW50UmVjdC5oZWlnaHQgLyAyKTtcbiAgICAgICAgdmVydGljYWxNYXJnaW4gKj0gLTE7XG4gICAgfVxuXG4gICAgaWYgKGFuY2hvckhvcml6b250YWwgPT09IHBvaW50LnJpZ2h0KSB7XG4gICAgICAgIGxlZnQgKz0gYW5jaG9yUmVjdC53aWR0aDtcbiAgICB9XG5cbiAgICBpZiAoYW5jaG9ySG9yaXpvbnRhbCA9PT0gcG9pbnQuY2VudGVyIHx8IGFuY2hvckhvcml6b250YWwgPT09IHBvaW50Lm1pZGRsZSkge1xuICAgICAgICBsZWZ0ICs9IE1hdGgucm91bmQoYW5jaG9yUmVjdC53aWR0aCAvIDIpO1xuICAgIH1cblxuICAgIGlmIChlbGVtZW50SG9yaXpvbnRhbCA9PT0gcG9pbnQucmlnaHQpIHtcbiAgICAgICAgbGVmdCAtPSBlbGVtZW50UmVjdC53aWR0aDtcbiAgICAgICAgaG9yaXpvbnRhbE1hcmdpbiAqPSAtMTtcbiAgICB9XG5cbiAgICBpZiAoZWxlbWVudEhvcml6b250YWwgPT09IHBvaW50LmNlbnRlciB8fCBlbGVtZW50SG9yaXpvbnRhbCA9PT0gcG9pbnQubWlkZGxlKSB7XG4gICAgICAgIGxlZnQgLT0gTWF0aC5yb3VuZChlbGVtZW50UmVjdC53aWR0aCAvIDIpO1xuICAgICAgICBob3Jpem9udGFsTWFyZ2luICo9IC0xO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogdG9wICsgdmVydGljYWxNYXJnaW4sXG4gICAgICAgIGxlZnQ6IGxlZnQgKyBob3Jpem9udGFsTWFyZ2luXG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGFsaWduO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYWRkU2Nyb2xsKHJlY3QsIHNjcm9sbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogcmVjdC50b3AgKyBzY3JvbGwueSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0ICsgc2Nyb2xsLngsXG4gICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiByZWN0LndpZHRoXG4gICAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFwcGx5TG9jYXRpb25PZmZzZXQocmVjdCwgbG9jYXRpb24sIGlzT2Zmc2V0Qm9keSkge1xuICAgIGxldCB7IHRvcCwgbGVmdCB9ID0gcmVjdDtcblxuICAgIGlmIChpc09mZnNldEJvZHkpIHtcbiAgICAgICAgbGVmdCA9IDA7XG4gICAgICAgIHRvcCA9IDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiB0b3AgKyBsb2NhdGlvbi50b3AsXG4gICAgICAgIGxlZnQ6IGxlZnQgKyBsb2NhdGlvbi5sZWZ0LFxuICAgICAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgICAgICB3aWR0aDogcmVjdC53aWR0aFxuICAgIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBvd25lckRvY3VtZW50KGVsZW1lbnQpIHtcbiAgICByZXR1cm4gZWxlbWVudC5vd25lckRvY3VtZW50IHx8IGVsZW1lbnQuZG9jdW1lbnQgfHwgZWxlbWVudDtcbn1cbiIsImltcG9ydCBvd25lckRvY3VtZW50IGZyb20gJy4vb3duZXItZG9jdW1lbnQnO1xuXG5jb25zdCBnZXRXaW5kb3cgPSAoZWxlbWVudCkgPT4gb3duZXJEb2N1bWVudChlbGVtZW50KS5kZWZhdWx0VmlldztcblxuZXhwb3J0IGRlZmF1bHQgZ2V0V2luZG93O1xuIiwiaW1wb3J0IG93bmVyRG9jdW1lbnQgZnJvbSAnLi9vd25lci1kb2N1bWVudCc7XG5cbmNvbnN0IGdldERvY3VtZW50ID0gKGVsZW1lbnQpID0+IG93bmVyRG9jdW1lbnQoZWxlbWVudCkuZG9jdW1lbnRFbGVtZW50O1xuXG5leHBvcnQgZGVmYXVsdCBnZXREb2N1bWVudDtcbiIsImxldCBjYWNoZWRXaWR0aCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjcm9sbGJhcldpZHRoKCkge1xuICAgIGlmICghY2FjaGVkV2lkdGggJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICBjb25zdCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuXG4gICAgICAgIGRpdi5zdHlsZS5jc3NUZXh0ID0gXCJvdmVyZmxvdzpzY3JvbGw7b3ZlcmZsb3cteDpoaWRkZW47em9vbToxO2NsZWFyOmJvdGg7ZGlzcGxheTpibG9ja1wiO1xuICAgICAgICBkaXYuaW5uZXJIVE1MID0gXCImbmJzcDtcIjtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIGNhY2hlZFdpZHRoID0gZGl2Lm9mZnNldFdpZHRoIC0gZGl2LnNjcm9sbFdpZHRoO1xuXG4gICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQoZGl2KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2FjaGVkV2lkdGg7XG59XG4iLCJpbXBvcnQgd25kIGZyb20gJy4vd2luZG93JztcbmltcG9ydCBnZXREb2N1bWVudCBmcm9tICcuL2RvY3VtZW50JztcbmltcG9ydCBzY3JvbGxiYXJXaWR0aCBmcm9tICcuL3Njcm9sbGJhci13aWR0aCc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHdpbmRvd1ZpZXdwb3J0KGVsZW1lbnQpIHtcbiAgICBjb25zdCB3aW4gPSB3bmQoZWxlbWVudCk7XG4gICAgY29uc3QgZG9jdW1lbnQgPSBnZXREb2N1bWVudChlbGVtZW50KTtcbiAgICBjb25zdCByZXN1bHQgPSB7XG4gICAgICAgIGhlaWdodDogd2luLmlubmVySGVpZ2h0LFxuICAgICAgICB3aWR0aDogd2luLmlubmVyV2lkdGhcbiAgICB9O1xuXG4gICAgaWYgKGRvY3VtZW50LnNjcm9sbEhlaWdodCAtIGRvY3VtZW50LmNsaWVudEhlaWdodCA+IDApIHtcbiAgICAgICAgcmVzdWx0LndpZHRoIC09IHNjcm9sbGJhcldpZHRoKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsImltcG9ydCB3aW5kb3dWaWV3cG9ydCBmcm9tICcuL3dpbmRvdy12aWV3cG9ydCc7XG5cbmNvbnN0IGJvdW5kaW5nT2Zmc2V0ID0gKGVsZW1lbnQpID0+IHtcbiAgICBpZiAoIWVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KSB7XG4gICAgICAgIGNvbnN0IHZpZXdwb3J0ID0gd2luZG93Vmlld3BvcnQoZWxlbWVudCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBib3R0b206IHZpZXdwb3J0LmhlaWdodCxcbiAgICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgICByaWdodDogdmlld3BvcnQud2lkdGgsXG4gICAgICAgICAgICB0b3A6IDBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGJvdHRvbSwgbGVmdCwgcmlnaHQsIHRvcCB9ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGJvdHRvbSxcbiAgICAgICAgbGVmdCxcbiAgICAgICAgcmlnaHQsXG4gICAgICAgIHRvcFxuICAgIH07XG59O1xuXG5leHBvcnQgZGVmYXVsdCBib3VuZGluZ09mZnNldDtcbiIsImltcG9ydCBkb2N1bWVudEVsZW1lbnQgZnJvbSAnLi9kb2N1bWVudCc7XG5cbmNvbnN0IG9mZnNldFBhcmVudCA9IChlbGVtZW50KSA9PiB7XG4gICAgbGV0IG9mZnNldFBhcmVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50O1xuXG4gICAgd2hpbGUgKG9mZnNldFBhcmVudCAmJiBvZmZzZXRQYXJlbnQuc3R5bGUucG9zaXRpb24gPT09IFwic3RhdGljXCIpIHtcbiAgICAgICAgb2Zmc2V0UGFyZW50ID0gb2Zmc2V0UGFyZW50Lm9mZnNldFBhcmVudDtcbiAgICB9XG5cbiAgICByZXR1cm4gb2Zmc2V0UGFyZW50IHx8IGRvY3VtZW50RWxlbWVudChlbGVtZW50KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9mZnNldFBhcmVudDtcbiIsImltcG9ydCBvZmZzZXRQYXJlbnQgZnJvbSAnLi9vZmZzZXQtcGFyZW50JztcblxuY29uc3QgaXNCb2R5T2Zmc2V0ID0gKGVsZW1lbnQpID0+IChvZmZzZXRQYXJlbnQoZWxlbWVudCkgPT09IGVsZW1lbnQub3duZXJEb2N1bWVudC5ib2R5KTtcblxuZXhwb3J0IGRlZmF1bHQgaXNCb2R5T2Zmc2V0O1xuIiwiY29uc3QgcmVjdE9mSGlkZGVuRWxlbWVudCA9IChlbGVtZW50KSA9PiB7XG4gICAgY29uc3QgeyBkaXNwbGF5LCBsZWZ0LCBwb3NpdGlvbiB9ID0gZWxlbWVudC5zdHlsZTtcblxuICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICcnO1xuICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9ICctMTAwMDBweCc7XG4gICAgZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG5cbiAgICBjb25zdCByZWN0ID0gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgIGVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbGVmdDtcbiAgICBlbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gcG9zaXRpb247XG5cbiAgICByZXR1cm4gcmVjdDtcbn07XG5cbmNvbnN0IG9mZnNldCA9IChlbGVtZW50KSA9PiB7XG4gICAgbGV0IHJlY3QgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGxldCB7IGxlZnQsIHRvcCB9ID0gcmVjdDtcblxuICAgIGlmICghcmVjdC5oZWlnaHQgJiYgIXJlY3Qud2lkdGgpIHtcbiAgICAgICAgcmVjdCA9IHJlY3RPZkhpZGRlbkVsZW1lbnQoZWxlbWVudCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiByZWN0LndpZHRoXG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9mZnNldDtcbiIsImV4cG9ydCBkZWZhdWx0IChlbGVtZW50LCB1bnRpbCkgPT4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IFtdO1xuICAgIGxldCBuZXh0ID0gZWxlbWVudC5wYXJlbnROb2RlO1xuXG4gICAgd2hpbGUgKG5leHQpIHtcbiAgICAgICAgcmVzdWx0LnB1c2gobmV4dCk7XG5cbiAgICAgICAgaWYgKG5leHQgPT09IHVudGlsKSB7IGJyZWFrOyB9XG5cbiAgICAgICAgbmV4dCA9IG5leHQucGFyZW50Tm9kZTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbiIsImltcG9ydCBkb2NFbGVtZW50IGZyb20gJy4vZG9jdW1lbnQnO1xuaW1wb3J0IHduZCBmcm9tICcuL3dpbmRvdyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNjcm9sbFBvc2l0aW9uKGVsZW1lbnQpIHtcbiAgICBjb25zdCBkb2N1bWVudEVsZW1lbnQgPSBkb2NFbGVtZW50KGVsZW1lbnQpO1xuICAgIGNvbnN0IHdpbiA9IHduZChlbGVtZW50KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHdpbi5wYWdlWE9mZnNldCB8fCBkb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdCB8fCAwLFxuICAgICAgICB5OiB3aW4ucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCAwXG4gICAgfTtcbn1cbiIsImltcG9ydCBzY3JvbGxQb3NpdGlvbiBmcm9tICcuL3Njcm9sbC1wb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IChlbGVtZW50KSA9PiB7XG4gICAgaWYgKGVsZW1lbnQgPT09IChlbGVtZW50Lm93bmVyRG9jdW1lbnQgfHwge30pLmJvZHkpIHtcbiAgICAgICAgcmV0dXJuIHNjcm9sbFBvc2l0aW9uKGVsZW1lbnQpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IGVsZW1lbnQuc2Nyb2xsTGVmdCxcbiAgICAgICAgeTogZWxlbWVudC5zY3JvbGxUb3BcbiAgICB9O1xufTtcbiIsImltcG9ydCBvZmZzZXRQYXJlbnQgZnJvbSAnLi9vZmZzZXQtcGFyZW50JztcbmltcG9ydCBlbGVtZW50U2Nyb2xsUG9zaXRpb24gZnJvbSAnLi9lbGVtZW50LXNjcm9sbC1wb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhcmVudFNjcm9sbFBvc2l0aW9uKGVsZW1lbnQpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBvZmZzZXRQYXJlbnQoZWxlbWVudCk7XG5cbiAgICByZXR1cm4gcGFyZW50ID8gZWxlbWVudFNjcm9sbFBvc2l0aW9uKHBhcmVudCkgOiB7IHg6IDAsIHk6IDAgfTtcbn1cbiIsImltcG9ydCBvZmZzZXRQYXJlbnQgZnJvbSAnLi9vZmZzZXQtcGFyZW50JztcbmltcG9ydCBvZmZzZXRSZWN0IGZyb20gJy4vb2Zmc2V0JztcbmltcG9ydCB3bmQgZnJvbSAnLi93aW5kb3cnO1xuXG5jb25zdCBwb3NpdGlvbiA9IChlbGVtZW50LCBwYXJlbnQpID0+IHtcbiAgICBjb25zdCB3aW4gPSB3bmQoZWxlbWVudCk7XG4gICAgY29uc3QgZWxlbWVudFN0eWxlcyA9IHdpbi5nZXRDb21wdXRlZFN0eWxlKGVsZW1lbnQpO1xuICAgIGNvbnN0IG9mZnNldCA9IG9mZnNldFJlY3QoZWxlbWVudCk7XG4gICAgY29uc3QgcGFyZW50RWxlbWVudCA9IHBhcmVudCB8fCBvZmZzZXRQYXJlbnQoZWxlbWVudCk7XG5cbiAgICBjb25zdCBvd25lckRvY3VtZW50ID0gZWxlbWVudC5vd25lckRvY3VtZW50O1xuICAgIGNvbnN0IHVzZVJlbGF0aXZlID0gcGFyZW50RWxlbWVudCAhPT0gb3duZXJEb2N1bWVudC5ib2R5ICYmIHBhcmVudEVsZW1lbnQgIT09IG93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuXG4gICAgbGV0IHBhcmVudE9mZnNldCA9IHsgdG9wOiAwLCBsZWZ0OiAwIH07XG5cbiAgICBpZiAoZWxlbWVudFN0eWxlcy5wb3NpdGlvbiAhPT0gXCJmaXhlZFwiICYmIHVzZVJlbGF0aXZlKSB7XG4gICAgICAgIGNvbnN0IHBhcmVudFN0eWxlcyA9IHdpbi5nZXRDb21wdXRlZFN0eWxlKHBhcmVudEVsZW1lbnQpO1xuXG4gICAgICAgIHBhcmVudE9mZnNldCA9IG9mZnNldFJlY3QocGFyZW50RWxlbWVudCk7XG4gICAgICAgIHBhcmVudE9mZnNldC50b3AgKz0gcGFyc2VJbnQocGFyZW50U3R5bGVzLmJvcmRlclRvcFdpZHRoLCAxMCk7XG4gICAgICAgIHBhcmVudE9mZnNldC5sZWZ0ICs9IHBhcnNlSW50KHBhcmVudFN0eWxlcy5ib3JkZXJMZWZ0V2lkdGgsIDEwKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB0b3A6IG9mZnNldC50b3AgLSBwYXJlbnRPZmZzZXQudG9wLFxuICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCAtIHBhcmVudE9mZnNldC5sZWZ0LFxuICAgICAgICBoZWlnaHQ6IG9mZnNldC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiBvZmZzZXQud2lkdGhcbiAgICB9O1xufTtcblxuZXhwb3J0IGRlZmF1bHQgcG9zaXRpb247XG4iLCJpbXBvcnQgZWxlbWVudFNjcm9sbFBvc2l0aW9uIGZyb20gJy4vZWxlbWVudC1zY3JvbGwtcG9zaXRpb24nO1xuaW1wb3J0IHBhcmVudFNjcm9sbFBvc2l0aW9uIGZyb20gJy4vcGFyZW50LXNjcm9sbC1wb3NpdGlvbic7XG5cbmV4cG9ydCBkZWZhdWx0IChvZmZzZXRQYXJlbnRFbGVtZW50LCBlbGVtZW50KSA9PiAoIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tYXJyb3ctY29uZGl0aW9uXG4gICAgb2Zmc2V0UGFyZW50RWxlbWVudCA/IGVsZW1lbnRTY3JvbGxQb3NpdGlvbihvZmZzZXRQYXJlbnRFbGVtZW50KSA6IHBhcmVudFNjcm9sbFBvc2l0aW9uKGVsZW1lbnQpXG4pO1xuIiwiaW1wb3J0IG9mZnNldFBhcmVudFNjcm9sbFBvc2l0aW9uIGZyb20gJy4vb2Zmc2V0LXBhcmVudC1zY3JvbGwtcG9zaXRpb24nO1xuaW1wb3J0IG9mZnNldFBhcmVudCBmcm9tICcuL29mZnNldC1wYXJlbnQnO1xuaW1wb3J0IHBvc2l0aW9uIGZyb20gJy4vcG9zaXRpb24nO1xuXG5leHBvcnQgZGVmYXVsdCAoZWxlbWVudCwgcGFyZW50LCBzY2FsZSA9IDEpID0+IHtcbiAgICBjb25zdCBvZmZzZXRQYXJlbnRFbGVtZW50ID0gcGFyZW50ID8gb2Zmc2V0UGFyZW50KHBhcmVudCkgOiBudWxsO1xuICAgIGNvbnN0IHsgdG9wLCBsZWZ0LCBoZWlnaHQsIHdpZHRoIH0gPSBwb3NpdGlvbihlbGVtZW50LCBvZmZzZXRQYXJlbnRFbGVtZW50KTtcbiAgICBjb25zdCB7IHgsIHkgfSA9IG9mZnNldFBhcmVudFNjcm9sbFBvc2l0aW9uKG9mZnNldFBhcmVudEVsZW1lbnQsIGVsZW1lbnQpO1xuICAgIGNvbnN0IG93bmVyRG9jdW1lbnQgPSBlbGVtZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgY29uc3QgcG9zaXRpb25TY2FsZSA9IG9mZnNldFBhcmVudEVsZW1lbnQgPT09IG93bmVyRG9jdW1lbnQuYm9keSB8fCBvZmZzZXRQYXJlbnRFbGVtZW50ID09PSBvd25lckRvY3VtZW50LmRvY3VtZW50RWxlbWVudCA/IDEgOiBzY2FsZTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogdG9wICsgeSAqIHBvc2l0aW9uU2NhbGUsXG4gICAgICAgIGxlZnQ6IGxlZnQgKyB4ICogcG9zaXRpb25TY2FsZSxcbiAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgIHdpZHRoOiB3aWR0aFxuICAgIH07XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmVtb3ZlU2Nyb2xsKHJlY3QsIHNjcm9sbCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHRvcDogcmVjdC50b3AgLSBzY3JvbGwueSxcbiAgICAgICAgbGVmdDogcmVjdC5sZWZ0IC0gc2Nyb2xsLngsXG4gICAgICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgICAgIHdpZHRoOiByZWN0LndpZHRoXG4gICAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgICBcImZpdFwiOiBcImZpdFwiLFxuICAgIFwiZmxpcFwiOiBcImZsaXBcIlxufTtcbiIsImltcG9ydCBhbGlnblBvaW50IGZyb20gJy4vYWxpZ24tcG9pbnQnO1xuaW1wb3J0IGNvbGxpc2lvbiBmcm9tICcuL2NvbGxpc2lvbic7XG5cbmNvbnN0IGZpdCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBzaXplLCB2aWV3UG9ydFNpemUpIHtcbiAgICBsZXQgb3V0cHV0ID0gMDtcblxuICAgIGlmIChwb3NpdGlvbiArIHNpemUgPiB2aWV3UG9ydFNpemUpIHtcbiAgICAgICAgb3V0cHV0ID0gdmlld1BvcnRTaXplIC0gKHBvc2l0aW9uICsgc2l6ZSk7XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMCkge1xuICAgICAgICBvdXRwdXQgPSAtcG9zaXRpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmNvbnN0IGZsaXAgPSBmdW5jdGlvbih7IG9mZnNldCwgc2l6ZSwgYW5jaG9yU2l6ZSwgdmlld1BvcnRTaXplLCBhbmNob3JBbGlnblBvaW50LCBlbGVtZW50QWxpZ25Qb2ludCwgbWFyZ2luIH0pIHtcbiAgICBsZXQgb3V0cHV0ID0gMDtcblxuICAgIGNvbnN0IGlzUG9zaXRpb25DZW50ZXJlZCA9IGVsZW1lbnRBbGlnblBvaW50ID09PSBhbGlnblBvaW50LmNlbnRlciB8fCBlbGVtZW50QWxpZ25Qb2ludCA9PT0gYWxpZ25Qb2ludC5taWRkbGU7XG4gICAgY29uc3QgaXNPcmlnaW5DZW50ZXJlZCA9IGFuY2hvckFsaWduUG9pbnQgPT09IGFsaWduUG9pbnQuY2VudGVyIHx8IGFuY2hvckFsaWduUG9pbnQgPT09IGFsaWduUG9pbnQubWlkZGxlO1xuICAgIGNvbnN0IG1hcmdpblRvQWRkID0gMiAqIG1hcmdpbjsgLy8yeCB0byBrZWVwIG1hcmdpbiBhZnRlciBmbGlwXG5cbiAgICBpZiAoZWxlbWVudEFsaWduUG9pbnQgIT09IGFuY2hvckFsaWduUG9pbnQgJiYgIWlzUG9zaXRpb25DZW50ZXJlZCAmJiAhaXNPcmlnaW5DZW50ZXJlZCkge1xuICAgICAgICBjb25zdCBpc0JlZm9yZUFuY2hvciA9IGFuY2hvckFsaWduUG9pbnQgPT09IGFsaWduUG9pbnQudG9wIHx8IGFuY2hvckFsaWduUG9pbnQgPT09IGFsaWduUG9pbnQubGVmdDtcbiAgICAgICAgaWYgKG9mZnNldCA8IDAgJiYgaXNCZWZvcmVBbmNob3IpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IHNpemUgKyBhbmNob3JTaXplICsgbWFyZ2luVG9BZGQ7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ICsgb3V0cHV0ICsgc2l6ZSA+IHZpZXdQb3J0U2l6ZSkge1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IDA7IC8vc2tpcCBmbGlwXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0ID49IDAgJiYgIWlzQmVmb3JlQW5jaG9yKSB7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ICsgc2l6ZSA+IHZpZXdQb3J0U2l6ZSkge1xuICAgICAgICAgICAgICAgIG91dHB1dCArPSAtKGFuY2hvclNpemUgKyBzaXplICsgbWFyZ2luVG9BZGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob2Zmc2V0ICsgb3V0cHV0IDwgMCkge1xuICAgICAgICAgICAgICAgIG91dHB1dCA9IDA7IC8vc2tpcCBmbGlwXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcblxuY29uc3QgcmVzdHJpY3RUb1ZpZXcgPSAob3B0aW9ucykgPT4ge1xuICAgIGNvbnN0IHsgYW5jaG9yUmVjdCwgYW5jaG9yQWxpZ24sIGVsZW1lbnRSZWN0LCBlbGVtZW50QWxpZ24sIGNvbGxpc2lvbnMsIHZpZXdQb3J0LCBtYXJnaW4gPSB7fSB9ID0gb3B0aW9ucztcbiAgICBjb25zdCB7IHRvcDogZWxlbWVudFRvcCwgbGVmdDogZWxlbWVudExlZnQsIGhlaWdodDogZWxlbWVudEhlaWdodCwgd2lkdGg6IGVsZW1lbnRXaWR0aCB9ID0gZWxlbWVudFJlY3Q7XG4gICAgY29uc3QgeyBoZWlnaHQ6IHZpZXdQb3J0SGVpZ2h0LCB3aWR0aDogdmlld1BvcnRXaWR0aCB9ID0gdmlld1BvcnQ7XG4gICAgY29uc3QgaG9yaXpvbnRhbE1hcmdpbiA9IG1hcmdpbi5ob3Jpem9udGFsIHx8IDA7XG4gICAgY29uc3QgdmVydGljYWxNYXJnaW4gPSBtYXJnaW4udmVydGljYWwgfHwgMDtcblxuICAgIGxldCBsZWZ0ID0gMDtcbiAgICBsZXQgdG9wID0gMDtcblxuICAgIGNvbnN0IGlzSG9yaXpvbnRhbEZsaXAgPSBjb2xsaXNpb25zLmhvcml6b250YWwgPT09IGNvbGxpc2lvbi5mbGlwO1xuICAgIGNvbnN0IGlzVmVydGljYWxGbGlwID0gY29sbGlzaW9ucy52ZXJ0aWNhbCA9PT0gY29sbGlzaW9uLmZsaXA7XG5cbiAgICBpZiAoY29sbGlzaW9ucy52ZXJ0aWNhbCA9PT0gY29sbGlzaW9uLmZpdCkge1xuICAgICAgICB0b3AgKz0gZml0KGVsZW1lbnRUb3AsIGVsZW1lbnRIZWlnaHQsIHZpZXdQb3J0SGVpZ2h0KTtcbiAgICB9XG5cbiAgICBpZiAoY29sbGlzaW9ucy5ob3Jpem9udGFsID09PSBjb2xsaXNpb24uZml0KSB7XG4gICAgICAgIGxlZnQgKz0gZml0KGVsZW1lbnRMZWZ0LCBlbGVtZW50V2lkdGgsIHZpZXdQb3J0V2lkdGgpO1xuICAgIH1cblxuICAgIGlmIChpc1ZlcnRpY2FsRmxpcCkge1xuICAgICAgICB0b3AgKz0gZmxpcCh7XG4gICAgICAgICAgICBtYXJnaW46IHZlcnRpY2FsTWFyZ2luLFxuICAgICAgICAgICAgb2Zmc2V0OiBlbGVtZW50VG9wLFxuICAgICAgICAgICAgc2l6ZTogZWxlbWVudEhlaWdodCxcbiAgICAgICAgICAgIGFuY2hvclNpemU6IGFuY2hvclJlY3QuaGVpZ2h0LFxuICAgICAgICAgICAgdmlld1BvcnRTaXplOiB2aWV3UG9ydEhlaWdodCxcbiAgICAgICAgICAgIGFuY2hvckFsaWduUG9pbnQ6IGFuY2hvckFsaWduLnZlcnRpY2FsLFxuICAgICAgICAgICAgZWxlbWVudEFsaWduUG9pbnQ6IGVsZW1lbnRBbGlnbi52ZXJ0aWNhbFxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoaXNIb3Jpem9udGFsRmxpcCkge1xuICAgICAgICBsZWZ0ICs9IGZsaXAoe1xuICAgICAgICAgICAgbWFyZ2luOiBob3Jpem9udGFsTWFyZ2luLFxuICAgICAgICAgICAgb2Zmc2V0OiBlbGVtZW50TGVmdCxcbiAgICAgICAgICAgIHNpemU6IGVsZW1lbnRXaWR0aCxcbiAgICAgICAgICAgIGFuY2hvclNpemU6IGFuY2hvclJlY3Qud2lkdGgsXG4gICAgICAgICAgICB2aWV3UG9ydFNpemU6IHZpZXdQb3J0V2lkdGgsXG4gICAgICAgICAgICBhbmNob3JBbGlnblBvaW50OiBhbmNob3JBbGlnbi5ob3Jpem9udGFsLFxuICAgICAgICAgICAgZWxlbWVudEFsaWduUG9pbnQ6IGVsZW1lbnRBbGlnbi5ob3Jpem9udGFsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdCBmbGlwcGVkSG9yaXpvbnRhbCA9IGlzSG9yaXpvbnRhbEZsaXAgJiYgbGVmdCAhPT0gMDtcbiAgICBjb25zdCBmbGlwcGVkVmVydGljYWwgPSBpc1ZlcnRpY2FsRmxpcCAmJiB0b3AgIT09IDA7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBmbGlwcGVkOiBmbGlwcGVkSG9yaXpvbnRhbCB8fCBmbGlwcGVkVmVydGljYWwsXG4gICAgICAgIGZsaXA6IHtcbiAgICAgICAgICAgIGhvcml6b250YWw6IGZsaXBwZWRIb3Jpem9udGFsLFxuICAgICAgICAgICAgdmVydGljYWw6IGZsaXBwZWRWZXJ0aWNhbFxuICAgICAgICB9LFxuICAgICAgICBvZmZzZXQ6IHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcFxuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHJlc3RyaWN0VG9WaWV3O1xuIiwiZXhwb3J0IGRlZmF1bHQgKGVsZW1lbnQpID0+IHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcblxuICAgIGxldCBzaWJsaW5nID0gZWxlbWVudC5wYXJlbnROb2RlLmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgd2hpbGUgKHNpYmxpbmcpIHtcbiAgICAgICAgaWYgKHNpYmxpbmcgIT09IGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNpYmxpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2libGluZyA9IHNpYmxpbmcubmV4dEVsZW1lbnRTaWJsaW5nO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIG5vLWxvb3AtZnVuYyAqL1xuXG5pbXBvcnQgcGFyZW50cyBmcm9tICcuL3BhcmVudHMnO1xuaW1wb3J0IHNpYmxpbmdzIGZyb20gJy4vc2libGluZ3MnO1xuXG5leHBvcnQgZGVmYXVsdCAoYW5jaG9yLCBjb250YWluZXIpID0+IHtcbiAgICBjb25zdCBwYXJlbnRFbGVtZW50cyA9IHBhcmVudHMoYW5jaG9yKTtcbiAgICBsZXQgY29udGFpbmVyRWxlbWVudCA9IGNvbnRhaW5lcjtcbiAgICBsZXQgc2libGluZ0VsZW1lbnRzO1xuICAgIGxldCByZXN1bHQ7XG5cbiAgICB3aGlsZSAoY29udGFpbmVyRWxlbWVudCkge1xuICAgICAgICBzaWJsaW5nRWxlbWVudHMgPSBzaWJsaW5ncyhjb250YWluZXJFbGVtZW50KTtcblxuICAgICAgICByZXN1bHQgPSBwYXJlbnRFbGVtZW50cy5yZWR1Y2UoXG4gICAgICAgICAgICAobGlzdCwgcCkgPT4gbGlzdC5jb25jYXQoc2libGluZ0VsZW1lbnRzLmZpbHRlcihzID0+IHMgPT09IHApKSxcbiAgICAgICAgICAgIFtdXG4gICAgICAgIClbMF07XG5cbiAgICAgICAgaWYgKHJlc3VsdCkgeyBicmVhazsgfVxuXG4gICAgICAgIGNvbnRhaW5lckVsZW1lbnQgPSBjb250YWluZXJFbGVtZW50LnBhcmVudEVsZW1lbnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbiJdLCJuYW1lcyI6WyJjb25zdCIsImxldCIsInBvaW50Iiwid25kIiwiZG9jdW1lbnRFbGVtZW50IiwiZG9jRWxlbWVudCIsIm9mZnNldCIsIm9mZnNldFJlY3QiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxpQkFBZTtJQUNYLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLFFBQVEsRUFBRSxRQUFRO0lBQ2xCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsT0FBTyxFQUFFLE9BQU87SUFDaEIsS0FBSyxFQUFFLEtBQUs7Q0FDZixDQUFDOztBQ0xGQSxJQUFNLEtBQUssR0FBRyxVQUFDLE9BQU8sRUFBRTtJQUNwQixJQUFRLFVBQVU7SUFBRSxJQUFBLFdBQVc7SUFBRSxJQUFBLFdBQVc7SUFBRSxJQUFBLFlBQVk7SUFBVywrREFBQSxFQUFFLENBQWpFO0lBQ05BLElBQU0sZ0JBQWdCLEdBQUcsV0FBVyxDQUFDLFVBQVUsQ0FBQztJQUNoREEsSUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLFFBQVEsQ0FBQztJQUM1Q0EsSUFBTSxpQkFBaUIsR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBQ2xEQSxJQUFNLGVBQWUsR0FBRyxZQUFZLENBQUMsUUFBUSxDQUFDOztJQUU5Q0MsSUFBSSxnQkFBZ0IsR0FBRyxNQUFNLENBQUMsVUFBVSxJQUFJLENBQUMsQ0FBQztJQUM5Q0EsSUFBSSxjQUFjLEdBQUcsTUFBTSxDQUFDLFFBQVEsSUFBSSxDQUFDLENBQUM7O0lBRTFDQSxJQUFJLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDO0lBQ3pCQSxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDOztJQUUzQixJQUFJLGNBQWMsS0FBS0MsVUFBSyxDQUFDLE1BQU0sRUFBRTtRQUNqQyxHQUFHLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQztLQUM1Qjs7SUFFRCxJQUFJLGNBQWMsS0FBS0EsVUFBSyxDQUFDLE1BQU0sSUFBSSxjQUFjLEtBQUtBLFVBQUssQ0FBQyxNQUFNLEVBQUU7UUFDcEUsR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztLQUM1Qzs7SUFFRCxJQUFJLGVBQWUsS0FBS0EsVUFBSyxDQUFDLE1BQU0sRUFBRTtRQUNsQyxHQUFHLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQztRQUMxQixjQUFjLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDeEI7O0lBRUQsSUFBSSxlQUFlLEtBQUtBLFVBQUssQ0FBQyxNQUFNLElBQUksZUFBZSxLQUFLQSxVQUFLLENBQUMsTUFBTSxFQUFFO1FBQ3RFLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDMUMsY0FBYyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3hCOztJQUVELElBQUksZ0JBQWdCLEtBQUtBLFVBQUssQ0FBQyxLQUFLLEVBQUU7UUFDbEMsSUFBSSxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUM7S0FDNUI7O0lBRUQsSUFBSSxnQkFBZ0IsS0FBS0EsVUFBSyxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsS0FBS0EsVUFBSyxDQUFDLE1BQU0sRUFBRTtRQUN4RSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzVDOztJQUVELElBQUksaUJBQWlCLEtBQUtBLFVBQUssQ0FBQyxLQUFLLEVBQUU7UUFDbkMsSUFBSSxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUM7UUFDMUIsZ0JBQWdCLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDMUI7O0lBRUQsSUFBSSxpQkFBaUIsS0FBS0EsVUFBSyxDQUFDLE1BQU0sSUFBSSxpQkFBaUIsS0FBS0EsVUFBSyxDQUFDLE1BQU0sRUFBRTtRQUMxRSxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQzFDLGdCQUFnQixJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQzFCOztJQUVELE9BQU87UUFDSCxHQUFHLEVBQUUsR0FBRyxHQUFHLGNBQWM7UUFDekIsSUFBSSxFQUFFLElBQUksR0FBRyxnQkFBZ0I7S0FDaEMsQ0FBQztDQUNMLENBQUMsQUFFRixBQUFxQjs7QUN6RE4sU0FBUyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtJQUM1QyxPQUFPO1FBQ0gsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEIsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDMUIsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNO1FBQ25CLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztLQUNwQixDQUFDO0NBQ0w7O0FDUGMsU0FBUyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRTtJQUN0RSxJQUFNLEdBQUc7SUFBRSxJQUFBLElBQUksYUFBWDs7SUFFSixJQUFJLFlBQVksRUFBRTtRQUNkLElBQUksR0FBRyxDQUFDLENBQUM7UUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDO0tBQ1g7O0lBRUQsT0FBTztRQUNILEdBQUcsRUFBRSxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUc7UUFDdkIsSUFBSSxFQUFFLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSTtRQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07UUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0tBQ3BCLENBQUM7Q0FDTDs7QUNkYyxTQUFTLGFBQWEsQ0FBQyxPQUFPLEVBQUU7SUFDM0MsT0FBTyxPQUFPLENBQUMsYUFBYSxJQUFJLE9BQU8sQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDO0NBQy9EOztBQ0FERixJQUFNLFNBQVMsR0FBRyxVQUFDLE9BQU8sRUFBRSxTQUFHLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEdBQUEsQ0FBQyxBQUVsRSxBQUF5Qjs7QUNGekJBLElBQU0sV0FBVyxHQUFHLFVBQUMsT0FBTyxFQUFFLFNBQUcsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLGVBQWUsR0FBQSxDQUFDLEFBRXhFLEFBQTJCOztBQ0ozQkMsSUFBSSxXQUFXLEdBQUcsQ0FBQyxDQUFDOztBQUVwQixBQUFlLFNBQVMsY0FBYyxHQUFHO0lBQ3JDLElBQUksQ0FBQyxXQUFXLElBQUksT0FBTyxRQUFRLEtBQUssV0FBVyxFQUFFO1FBQ2pERCxJQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDOztRQUUxQyxHQUFHLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxtRUFBbUUsQ0FBQztRQUN4RixHQUFHLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztRQUN6QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQzs7UUFFL0IsV0FBVyxHQUFHLEdBQUcsQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDLFdBQVcsQ0FBQzs7UUFFaEQsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEM7O0lBRUQsT0FBTyxXQUFXLENBQUM7Q0FDdEI7O0FDWmMsU0FBUyxjQUFjLENBQUMsT0FBTyxFQUFFO0lBQzVDQSxJQUFNLEdBQUcsR0FBR0csU0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pCSCxJQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdENBLElBQU0sTUFBTSxHQUFHO1FBQ1gsTUFBTSxFQUFFLEdBQUcsQ0FBQyxXQUFXO1FBQ3ZCLEtBQUssRUFBRSxHQUFHLENBQUMsVUFBVTtLQUN4QixDQUFDOztJQUVGLElBQUksUUFBUSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsWUFBWSxHQUFHLENBQUMsRUFBRTtRQUNuRCxNQUFNLENBQUMsS0FBSyxJQUFJLGNBQWMsRUFBRSxDQUFDO0tBQ3BDOztJQUVELE9BQU8sTUFBTSxDQUFDO0NBQ2pCOztBQ2ZEQSxJQUFNLGNBQWMsR0FBRyxVQUFDLE9BQU8sRUFBRTtJQUM3QixJQUFJLENBQUMsT0FBTyxDQUFDLHFCQUFxQixFQUFFO1FBQ2hDQSxJQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekMsT0FBTztZQUNILE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTTtZQUN2QixJQUFJLEVBQUUsQ0FBQztZQUNQLEtBQUssRUFBRSxRQUFRLENBQUMsS0FBSztZQUNyQixHQUFHLEVBQUUsQ0FBQztTQUNULENBQUM7S0FDTDs7SUFFRCxPQUFrQyxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRTtJQUE1RCxJQUFBLE1BQU07SUFBRSxJQUFBLElBQUk7SUFBRSxJQUFBLEtBQUs7SUFBRSxJQUFBLEdBQUcsV0FBMUI7O0lBRU4sT0FBTztRQUNILFFBQUEsTUFBTTtRQUNOLE1BQUEsSUFBSTtRQUNKLE9BQUEsS0FBSztRQUNMLEtBQUEsR0FBRztLQUNOLENBQUM7Q0FDTCxDQUFDLEFBRUYsQUFBOEI7O0FDckI5QkEsSUFBTSxZQUFZLEdBQUcsVUFBQyxPQUFPLEVBQUU7SUFDM0JDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7O0lBRXhDLE9BQU8sWUFBWSxJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFFBQVEsRUFBRTtRQUM3RCxZQUFZLEdBQUcsWUFBWSxDQUFDLFlBQVksQ0FBQztLQUM1Qzs7SUFFRCxPQUFPLFlBQVksSUFBSUcsV0FBZSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0NBQ25ELENBQUMsQUFFRixBQUE0Qjs7QUNWNUJKLElBQU0sWUFBWSxHQUFHLFVBQUMsT0FBTyxFQUFFLFNBQUcsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBQSxDQUFDLEFBRXpGLEFBQTRCOztBQ0o1QkEsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLE9BQU8sRUFBRTtJQUNsQyxPQUFpQyxHQUFHLE9BQU8sQ0FBQyxLQUFLO0lBQXpDLElBQUEsT0FBTztJQUFFLElBQUEsSUFBSTtJQUFFLElBQUEsUUFBUSxnQkFBekI7O0lBRU4sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0lBQzNCLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLFVBQVUsQ0FBQztJQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7O0lBRXBDQSxJQUFNLElBQUksR0FBRyxPQUFPLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7SUFFN0MsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztJQUMxQixPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0lBRWxDLE9BQU8sSUFBSSxDQUFDO0NBQ2YsQ0FBQzs7QUFFRkEsSUFBTSxNQUFNLEdBQUcsVUFBQyxPQUFPLEVBQUU7SUFDckJDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0lBQzNDLElBQU0sSUFBSTtJQUFFLElBQUEsR0FBRyxZQUFYOztJQUVKLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtRQUM3QixJQUFJLEdBQUcsbUJBQW1CLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDdkM7O0lBRUQsT0FBTztRQUNILEdBQUcsRUFBRSxHQUFHO1FBQ1IsSUFBSSxFQUFFLElBQUk7UUFDVixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07UUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0tBQ3BCLENBQUM7Q0FDTCxDQUFDLEFBRUYsQUFBc0I7O0FDaEN0QixjQUFlLFVBQUMsT0FBTyxFQUFFLEtBQUssRUFBRTtJQUM1QkQsSUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDO0lBQ2xCQyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDOztJQUU5QixPQUFPLElBQUksRUFBRTtRQUNULE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7O1FBRWxCLElBQUksSUFBSSxLQUFLLEtBQUssRUFBRSxFQUFFLE1BQU0sRUFBRTs7UUFFOUIsSUFBSSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7S0FDMUI7O0lBRUQsT0FBTyxNQUFNLENBQUM7Q0FDakIsQ0FBQSxBQUFDOztBQ1ZhLFNBQVMsY0FBYyxDQUFDLE9BQU8sRUFBRTtJQUM1Q0QsSUFBTSxlQUFlLEdBQUdLLFdBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUM1Q0wsSUFBTSxHQUFHLEdBQUdHLFNBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQzs7SUFFekIsT0FBTztRQUNILENBQUMsRUFBRSxHQUFHLENBQUMsV0FBVyxJQUFJLGVBQWUsQ0FBQyxVQUFVLElBQUksQ0FBQztRQUNyRCxDQUFDLEVBQUUsR0FBRyxDQUFDLFdBQVcsSUFBSSxlQUFlLENBQUMsU0FBUyxJQUFJLENBQUM7S0FDdkQsQ0FBQztDQUNMOztBQ1RELDRCQUFlLFVBQUMsT0FBTyxFQUFFO0lBQ3JCLElBQUksT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7UUFDaEQsT0FBTyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDbEM7O0lBRUQsT0FBTztRQUNILENBQUMsRUFBRSxPQUFPLENBQUMsVUFBVTtRQUNyQixDQUFDLEVBQUUsT0FBTyxDQUFDLFNBQVM7S0FDdkIsQ0FBQztDQUNMLENBQUEsQUFBQzs7QUNSYSxTQUFTLG9CQUFvQixDQUFDLE9BQU8sRUFBRTtJQUNsREgsSUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztJQUVyQyxPQUFPLE1BQU0sR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0NBQ2xFOztBQ0hEQSxJQUFNLFFBQVEsR0FBRyxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUU7SUFDL0JBLElBQU0sR0FBRyxHQUFHRyxTQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekJILElBQU0sYUFBYSxHQUFHLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNwREEsSUFBTU0sU0FBTSxHQUFHQyxNQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDbkNQLElBQU0sYUFBYSxHQUFHLE1BQU0sSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7O0lBRXREQSxJQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO0lBQzVDQSxJQUFNLFdBQVcsR0FBRyxhQUFhLEtBQUssYUFBYSxDQUFDLElBQUksSUFBSSxhQUFhLEtBQUssYUFBYSxDQUFDLGVBQWUsQ0FBQzs7SUFFNUdDLElBQUksWUFBWSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0lBRXZDLElBQUksYUFBYSxDQUFDLFFBQVEsS0FBSyxPQUFPLElBQUksV0FBVyxFQUFFO1FBQ25ERCxJQUFNLFlBQVksR0FBRyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLENBQUM7O1FBRXpELFlBQVksR0FBR08sTUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3pDLFlBQVksQ0FBQyxHQUFHLElBQUksUUFBUSxDQUFDLFlBQVksQ0FBQyxjQUFjLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDOUQsWUFBWSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsWUFBWSxDQUFDLGVBQWUsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNuRTs7SUFFRCxPQUFPO1FBQ0gsR0FBRyxFQUFFRCxTQUFNLENBQUMsR0FBRyxHQUFHLFlBQVksQ0FBQyxHQUFHO1FBQ2xDLElBQUksRUFBRUEsU0FBTSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUMsSUFBSTtRQUNyQyxNQUFNLEVBQUVBLFNBQU0sQ0FBQyxNQUFNO1FBQ3JCLEtBQUssRUFBRUEsU0FBTSxDQUFDLEtBQUs7S0FDdEIsQ0FBQztDQUNMLENBQUMsQUFFRixBQUF3Qjs7QUM1QnhCLGlDQUFlLFVBQUMsbUJBQW1CLEVBQUUsT0FBTyxFQUFFLFNBQUc7SUFDN0MsbUJBQW1CLEdBQUcscUJBQXFCLENBQUMsbUJBQW1CLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxPQUFPLENBQUM7Q0FDbkcsR0FBQSxDQUFBLEFBQUM7O0FDREYseUJBQWUsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQVMsRUFBRTtpQ0FBTixHQUFHLENBQUM7O0lBQ3RDTixJQUFNLG1CQUFtQixHQUFHLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQ2pFLE9BQWtDLEdBQUcsUUFBUSxDQUFDLE9BQU8sRUFBRSxtQkFBbUIsQ0FBQztJQUFuRSxJQUFBLEdBQUc7SUFBRSxJQUFBLElBQUk7SUFBRSxJQUFBLE1BQU07SUFBRSxJQUFBLEtBQUssYUFBMUI7SUFDTixTQUFjLEdBQUcsMEJBQTBCLENBQUMsbUJBQW1CLEVBQUUsT0FBTyxDQUFDO0lBQWpFLElBQUEsQ0FBQztJQUFFLElBQUEsQ0FBQyxXQUFOO0lBQ05BLElBQU0sYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7SUFDNUNBLElBQU0sYUFBYSxHQUFHLG1CQUFtQixLQUFLLGFBQWEsQ0FBQyxJQUFJLElBQUksbUJBQW1CLEtBQUssYUFBYSxDQUFDLGVBQWUsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDOztJQUV0SSxPQUFPO1FBQ0gsR0FBRyxFQUFFLEdBQUcsR0FBRyxDQUFDLEdBQUcsYUFBYTtRQUM1QixJQUFJLEVBQUUsSUFBSSxHQUFHLENBQUMsR0FBRyxhQUFhO1FBQzlCLE1BQU0sRUFBRSxNQUFNO1FBQ2QsS0FBSyxFQUFFLEtBQUs7S0FDZixDQUFDO0NBQ0wsQ0FBQSxBQUFDOztBQ2pCYSxTQUFTLFlBQVksQ0FBQyxJQUFJLEVBQUUsTUFBTSxFQUFFO0lBQy9DLE9BQU87UUFDSCxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQztRQUN4QixJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxNQUFNLENBQUMsQ0FBQztRQUMxQixNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07UUFDbkIsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO0tBQ3BCLENBQUM7Q0FDTDs7QUNQRCxnQkFBZTtJQUNYLEtBQUssRUFBRSxLQUFLO0lBQ1osTUFBTSxFQUFFLE1BQU07Q0FDakIsQ0FBQzs7QUNBRkEsSUFBTSxHQUFHLEdBQUcsU0FBUyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRTtJQUMvQ0MsSUFBSSxNQUFNLEdBQUcsQ0FBQyxDQUFDOztJQUVmLElBQUksUUFBUSxHQUFHLElBQUksR0FBRyxZQUFZLEVBQUU7UUFDaEMsTUFBTSxHQUFHLFlBQVksR0FBRyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM3Qzs7SUFFRCxJQUFJLFFBQVEsR0FBRyxDQUFDLEVBQUU7UUFDZCxNQUFNLEdBQUcsQ0FBQyxRQUFRLENBQUM7S0FDdEI7O0lBRUQsT0FBTyxNQUFNLENBQUM7Q0FDakIsQ0FBQzs7QUFFRkQsSUFBTSxJQUFJLEdBQUcsU0FBUyxHQUFBLEVBQXlGO1FBQXZGLE1BQU0sY0FBRTtRQUFBLElBQUksWUFBRTtRQUFBLFVBQVUsa0JBQUU7UUFBQSxZQUFZLG9CQUFFO1FBQUEsZ0JBQWdCLHdCQUFFO1FBQUEsaUJBQWlCLHlCQUFFO1FBQUEsTUFBTTs7SUFDdkdDLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7SUFFZkQsSUFBTSxrQkFBa0IsR0FBRyxpQkFBaUIsS0FBSyxVQUFVLENBQUMsTUFBTSxJQUFJLGlCQUFpQixLQUFLLFVBQVUsQ0FBQyxNQUFNLENBQUM7SUFDOUdBLElBQU0sZ0JBQWdCLEdBQUcsZ0JBQWdCLEtBQUssVUFBVSxDQUFDLE1BQU0sSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsTUFBTSxDQUFDO0lBQzFHQSxJQUFNLFdBQVcsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDOztJQUUvQixJQUFJLGlCQUFpQixLQUFLLGdCQUFnQixJQUFJLENBQUMsa0JBQWtCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtRQUNwRkEsSUFBTSxjQUFjLEdBQUcsZ0JBQWdCLEtBQUssVUFBVSxDQUFDLEdBQUcsSUFBSSxnQkFBZ0IsS0FBSyxVQUFVLENBQUMsSUFBSSxDQUFDO1FBQ25HLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxjQUFjLEVBQUU7WUFDOUIsTUFBTSxHQUFHLElBQUksR0FBRyxVQUFVLEdBQUcsV0FBVyxDQUFDO1lBQ3pDLElBQUksTUFBTSxHQUFHLE1BQU0sR0FBRyxJQUFJLEdBQUcsWUFBWSxFQUFFO2dCQUN2QyxNQUFNLEdBQUcsQ0FBQyxDQUFDO2FBQ2Q7U0FDSixNQUFNLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN2QyxJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsWUFBWSxFQUFFO2dCQUM5QixNQUFNLElBQUksQ0FBQyxDQUFDLFVBQVUsR0FBRyxJQUFJLEdBQUcsV0FBVyxDQUFDLENBQUM7YUFDaEQ7O1lBRUQsSUFBSSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDckIsTUFBTSxHQUFHLENBQUMsQ0FBQzthQUNkO1NBQ0o7S0FDSjs7SUFFRCxPQUFPLE1BQU0sQ0FBQztDQUNqQixDQUFDOztBQUVGQSxJQUFNLGNBQWMsR0FBRyxVQUFDLE9BQU8sRUFBRTtJQUM3QixJQUFRLFVBQVU7SUFBRSxJQUFBLFdBQVc7SUFBRSxJQUFBLFdBQVc7SUFBRSxJQUFBLFlBQVk7SUFBRSxJQUFBLFVBQVU7SUFBRSxJQUFBLFFBQVE7SUFBVywrREFBQSxFQUFFLENBQXZGO0lBQ04sSUFBYSxVQUFVO0lBQVEsSUFBQSxXQUFXO0lBQVUsSUFBQSxhQUFhO0lBQVMsSUFBQSxZQUFZLHFCQUFoRjtJQUNOLElBQWdCLGNBQWM7SUFBUyxJQUFBLGFBQWEsa0JBQTlDO0lBQ05BLElBQU0sZ0JBQWdCLEdBQUcsTUFBTSxDQUFDLFVBQVUsSUFBSSxDQUFDLENBQUM7SUFDaERBLElBQU0sY0FBYyxHQUFHLE1BQU0sQ0FBQyxRQUFRLElBQUksQ0FBQyxDQUFDOztJQUU1Q0MsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO0lBQ2JBLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQzs7SUFFWkQsSUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsVUFBVSxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUM7SUFDbEVBLElBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQzs7SUFFOUQsSUFBSSxVQUFVLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDdkMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ3pEOztJQUVELElBQUksVUFBVSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUMsR0FBRyxFQUFFO1FBQ3pDLElBQUksSUFBSSxHQUFHLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztLQUN6RDs7SUFFRCxJQUFJLGNBQWMsRUFBRTtRQUNoQixHQUFHLElBQUksSUFBSSxDQUFDO1lBQ1IsTUFBTSxFQUFFLGNBQWM7WUFDdEIsTUFBTSxFQUFFLFVBQVU7WUFDbEIsSUFBSSxFQUFFLGFBQWE7WUFDbkIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxNQUFNO1lBQzdCLFlBQVksRUFBRSxjQUFjO1lBQzVCLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxRQUFRO1lBQ3RDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxRQUFRO1NBQzNDLENBQUMsQ0FBQztLQUNOOztJQUVELElBQUksZ0JBQWdCLEVBQUU7UUFDbEIsSUFBSSxJQUFJLElBQUksQ0FBQztZQUNULE1BQU0sRUFBRSxnQkFBZ0I7WUFDeEIsTUFBTSxFQUFFLFdBQVc7WUFDbkIsSUFBSSxFQUFFLFlBQVk7WUFDbEIsVUFBVSxFQUFFLFVBQVUsQ0FBQyxLQUFLO1lBQzVCLFlBQVksRUFBRSxhQUFhO1lBQzNCLGdCQUFnQixFQUFFLFdBQVcsQ0FBQyxVQUFVO1lBQ3hDLGlCQUFpQixFQUFFLFlBQVksQ0FBQyxVQUFVO1NBQzdDLENBQUMsQ0FBQztLQUNOO0lBQ0RBLElBQU0saUJBQWlCLEdBQUcsZ0JBQWdCLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQztJQUN6REEsSUFBTSxlQUFlLEdBQUcsY0FBYyxJQUFJLEdBQUcsS0FBSyxDQUFDLENBQUM7O0lBRXBELE9BQU87UUFDSCxPQUFPLEVBQUUsaUJBQWlCLElBQUksZUFBZTtRQUM3QyxJQUFJLEVBQUU7WUFDRixVQUFVLEVBQUUsaUJBQWlCO1lBQzdCLFFBQVEsRUFBRSxlQUFlO1NBQzVCO1FBQ0QsTUFBTSxFQUFFO1lBQ0osSUFBSSxFQUFFLElBQUk7WUFDVixHQUFHLEVBQUUsR0FBRztTQUNYO0tBQ0osQ0FBQztDQUNMLENBQUMsQUFFRixBQUE4Qjs7QUN6RzlCLGVBQWUsVUFBQyxPQUFPLEVBQUU7SUFDckJBLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQzs7SUFFbEJDLElBQUksT0FBTyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUM7O0lBRW5ELE9BQU8sT0FBTyxFQUFFO1FBQ1osSUFBSSxPQUFPLEtBQUssT0FBTyxFQUFFO1lBQ3JCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDeEI7O1FBRUQsT0FBTyxHQUFHLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQztLQUN4QztJQUNELE9BQU8sTUFBTSxDQUFDO0NBQ2pCLENBQUEsQUFBQzs7QUNiRjs7QUFFQSxBQUNBLEFBRUEsdUJBQWUsVUFBQyxNQUFNLEVBQUUsU0FBUyxFQUFFO0lBQy9CRCxJQUFNLGNBQWMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDdkNDLElBQUksZ0JBQWdCLEdBQUcsU0FBUyxDQUFDO0lBQ2pDQSxJQUFJLGVBQWUsQ0FBQztJQUNwQkEsSUFBSSxNQUFNLENBQUM7O0lBRVgsT0FBTyxnQkFBZ0IsRUFBRTtRQUNyQixlQUFlLEdBQUcsUUFBUSxDQUFDLGdCQUFnQixDQUFDLENBQUM7O1FBRTdDLE1BQU0sR0FBRyxjQUFjLENBQUMsTUFBTTtZQUMxQixVQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsU0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBQSxDQUFDLEVBQUMsU0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFBLENBQUMsQ0FBQyxHQUFBO1lBQzlELEVBQUU7U0FDTCxDQUFDLENBQUMsQ0FBQyxDQUFDOztRQUVMLElBQUksTUFBTSxFQUFFLEVBQUUsTUFBTSxFQUFFOztRQUV0QixnQkFBZ0IsR0FBRyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUM7S0FDckQ7O0lBRUQsT0FBTyxNQUFNLENBQUM7Q0FDakIsQ0FBQSxBQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9