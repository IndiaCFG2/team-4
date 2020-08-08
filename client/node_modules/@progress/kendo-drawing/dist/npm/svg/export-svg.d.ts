import { Group } from '../drawing';

// tslint:disable:max-line-length
/**
 * The SVG Export Options ([see example]({% slug exportingtosvg_drawing %})).
 */
export interface SVGExportOptions {
  /**
   * If set to `true`, the promise is resolved with the raw SVG document without the Data URI prefix.
   *
   * @default false
   */
  raw?: boolean;
}

/**
 * Exports a group of Drawing elements as an SVG document. In the exported file, the group is positioned at `[0, 0]`. Its dimensions will be used as the default dimensions of the image. The export operation is asynchronous and returns a promise. The promise will be resolved with an SVG document encoded as a [Data URI](https://developer.mozilla.org/en-US/docs/data_URIs).
 *
 * {% platform_content angular %}
 * {% embed_file export-svg/export-scene.ts preview %}
 * {% embed_file export-svg/app.component.ts %}
 * {% embed_file shared/app.module.ts hidden %}
 * {% embed_file shared/main.ts hidden %}
 * {% endplatform_content %}
 * {% platform_content react %}
 * {% embed_file react/export-svg/export-scene.js %}
 * {% embed_file react/export-svg/main.jsx preview %}
 * {% endplatform_content %}
 *
 * @param group - The root group containing all elements to export.
 * @param options - The export options.
 * @return - A promise that will be resolved with an SVG document encoded as a Data URI.
 */
// tslint:enable:max-line-length
export function exportSVG(group: Group, options?: SVGExportOptions): Promise<string>;
