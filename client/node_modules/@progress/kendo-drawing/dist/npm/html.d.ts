import { Group } from './shapes'
import { PaperSize, PageMargin } from './pdf';

// tslint:disable:max-line-length
/**
 * The configuration options for the `drawDOM` method.
 */
export interface DrawOptions {
  /**
   * A flag that indicates whether to produce clickable hyperlinks in the exported PDF file ([see example]({% slug hyperlinks_drawing %})). You can also pass a CSS selector as an argument. All matching links are ignored.
   *
   * @default false
   */
  avoidLinks?: boolean | string;

  /**
   * An optional CSS selector that specifies the elements which cause the page breaks ([see example]({% slug multipagecontent_drawing %}#toc-automatic-page-breaking)).
   */
  forcePageBreak?: string;

  /**
   * An optional CSS selector that specifies the elements which should not be split across the pages ([see example]({% slug multipagecontent_drawing %}#toc-automatic-page-breaking)).
   */
  keepTogether?: string;

  /**
   * A flag indicating if the page should be in a landscape orientation. By default, the page is in a portrait orientation.
   *
   * @default false
   */
  landscape?: boolean;

  /**
   * The paper size for automatic page breaking. The default `"auto"` configuration means that the paper size is determined by the content.
   *
   * @default "auto"
   */
  paperSize?: PaperSize;

  /**
   * Specifies the margins of the page (numbers or strings with units).
   */
  margin?: PageMargin;

  /**
   * Specifies if the `<thead>` elements of the tables should be repeated on each page.
   */
  repeatHeaders?: boolean;

  /**
   * A scale factor that will be applied to the elements ([see example]({% slug scalingofcontent_drawing %})). Can be set to a number, array (`[ xScale, yScale ]`), or an object (`{ x: xScale, y: yScale }`).
   */
  scale?: number | number[] | any;

  /**
   * The page template for multi-page output.
   */
  template?: string | ((context: any) => string);

  /**
   * @hidden
   *
   * Internal. Specifies if the page breaking algorithm may destroy
   * the original DOM, instead of cloning it (default is to clone).
   */
  _destructive?: boolean;
}

/**
 * Converts the given DOM element to a drawing scene ([see example]({% slug drawingofhtmlelements_drawing %}#toc-getting-started)). The operation is asynchronous and returns a promise that will be resolved with the root `Group` of the scene.
 *
 * @param element - The root DOM element to draw.
 * @param options - The conversion options.
 * @return - A promise that will be resolved with the root `Group` of the scene.
 */
// tslint:enable:max-line-length
export function drawDOM(element: HTMLElement, options?: DrawOptions): Promise<Group>;
