import { OptionsStore } from '../core';
import { Point, Rect, Transformation } from '../geometry';
import { Path } from './path';

// tslint:disable:max-line-length
/**
 * Common drawing element options.
 */
export interface ElementOptions {
  /**
   * The clipping path for this element. The Path instance will be monitored for changes. Can be replaced by calling the [`clip`](#toc-clip) method.
   */
  clip?: Path;

  /**
   * The [CSS cursor](https://developer.mozilla.org/en-US/docs/Web/CSS/cursor) of the element.
   */
  cursor?: string;

  /**
   * The optional name for this element.
   */
  name?: string;

  /**
   * An optional id. The id will be rendered only for SVG output.
   */
  id?: string;

  /**
   * The element opacity. Ranges from zero (completely transparent) to one (completely opaque).
   */
  opacity?: number;

  /**
   * The transformation to apply to this element.
   */
  transform?: Transformation;

  /**
   * A flag which indicates if the element is visible.
   */
  visible?: boolean;
}

/**
 * An abstract base class representing common members of all drawing elements.
 */
export abstract class Element {
  /**
   * The configuration of this element.
   */
  options: OptionsStore;

  /**
   * Returns the bounding box of the element with applied transformations.
   *
   * @return - The bounding box of the element with transformations applied.
   */
  bbox(): Rect;

  /**
   * Gets the clipping path for this element.
   *
   * @return - The clipping path for this element.
   */
  clip(): Path;

  /**
   * Sets the clipping path for this element. The Path instance will be monitored for changes. Can be replaced by calling the [`clip`](#toc-clip) method.
   *
   * The following example demonstrates how to set a clipping path on a Circle.
   *
   * {% platform_content angular %}
   * {% embed_file element-clip/draw-scene.ts %}
   * {% embed_file shared/app.component.ts %}
   * {% embed_file shared/app.module.ts hidden %}
   * {% embed_file shared/main.ts hidden %}
   * {% endplatform_content %}
   * {% platform_content react %}
   * {% embed_file react/element-clip/draw-scene.js %}
   * {% embed_file react/shared/main.jsx %}
   * {% endplatform_content %}
   *
   * The following example demonstrates how to clear a clipping path.
   *
   * {% platform_content angular %}
   * {% embed_file element-clip-clear/draw-scene.ts %}
   * {% embed_file shared/app.component.ts %}
   * {% embed_file shared/app.module.ts hidden %}
   * {% embed_file shared/main.ts hidden %}
   * {% endplatform_content %}
   * {% platform_content react %}
   * {% embed_file react/element-clip-clear/draw-scene.js %}
   * {% embed_file react/shared/main.jsx %}
   * {% endplatform_content %}
   *
   * @param clip The element clipping path.
   */
  clip(clip: Path): void;

  /**
   * Returns the bounding box of the element with clipping and transformations applied. This is the rectangle that will fit around the actual rendered element.
   *
   * @return - The bounding box of the element with clipping and transformations applied.
   */
  clippedBBox(): Rect;

  /**
   * Returns `true` if the shape contains the specified point.
   *
   * @param point - The point that should be checked.
   * @return value indicating if the shape contains the point.
   */
  containsPoint(point: Point): boolean;

  /**
   * Gets the element opacity.
   *
   * @return The current element opacity.
   */
  opacity(): number;

  /**
   * Sets the opacity of the element.
   *
   * {% platform_content angular %}
   * {% embed_file element-opacity/draw-scene.ts %}
   * {% embed_file shared/app.component.ts %}
   * {% embed_file shared/app.module.ts hidden %}
   * {% embed_file shared/main.ts hidden %}
   * {% endplatform_content %}
   * {% platform_content react %}
   * {% embed_file react/element-opacity/draw-scene.js %}
   * {% embed_file react/shared/main.jsx %}
   * {% endplatform_content %}
   *
   * @param opacity - The element opacity. Ranges from 0 (completely transparent) to 1 (completely opaque).
   */
  opacity(opacity: number): void;

  /**
   * Gets the transformation of the element.
   *
   * @return - The current transformation on the element.
   */
  transform(): Transformation;

  /**
   * Sets the transformation of the element.
   *
   * {% platform_content angular %}
   * {% embed_file element-transform/draw-scene.ts %}
   * {% embed_file shared/app.component.ts %}
   * {% embed_file shared/app.module.ts hidden %}
   * {% embed_file shared/main.ts hidden %}
   * {% endplatform_content %}
   * {% platform_content react %}
   * {% embed_file react/element-transform/draw-scene.js %}
   * {% embed_file react/shared/main.jsx %}
   * {% endplatform_content %}
   *
   * @param transform - The transformation to apply to the element.
   */
  transform(transform: Transformation): void;

  /**
   * Gets the visibility of the element.
   *
   * @return true if the element is visible. Otherwise, returns `false`.
   */
  visible(): boolean;

  /**
   * Sets the visibility of the element.
   *
   * {% platform_content angular %}
   * {% embed_file element-visibility/draw-scene.ts %}
   * {% embed_file shared/app.component.ts %}
   * {% embed_file shared/app.module.ts hidden %}
   * {% embed_file shared/main.ts hidden %}
   * {% endplatform_content %}
   * {% platform_content react %}
   * {% embed_file react/element-visibility/draw-scene.js %}
   * {% embed_file react/shared/main.jsx %}
   * {% endplatform_content %}
   *
   * @param visible - A flag which indicates if the element will be visible.
   */
  visible(visible: boolean): void;
}
// tslint:enable:max-line-length
