// To list new API calls to the File Saver documentation, manually add them to `kendo-file-saver/docs/api`.
// Due to the specifics of the component and unlike the other Kendo UI components for Angular,
// the API documentation of the File Server is not generated from the `src` files.

/**
 * An interface which defines the configuration options for the
 * [`saveAs`]({% slug api_filesaver_filesaver %}) function.
 */
export interface SaveOptions {
  /**
   * If set to `true`, the content is forwarded to `proxyURL` even if the browser supports the local saving of files.
   * By default, the value is `false`.
   */
  forceProxy?: boolean;

  /**
   * The URL of the server-side proxy which streams the file to the end user.
   * When the browser is not capable of saving files locally, the proxy will be used.
   * Such browsers are Internet Explorer v9 or earlier, and Safari.
   * It is the developer who is responsible for the implementation of the server-side proxy.
   *
   * The proxy receives a `POST` request with the following parameters in the request body:
   * * `contentType`&mdash;The MIME type of the file.
   * * `base64`&mdash;The Base64-encoded file content.
   * * `fileName`&mdashh;The file name as requested by the caller.
   * * Additional fields which are set through the optional `proxyData`.
   *
   * The proxy returns the decoded file with a set `"Content-Disposition"` header.
   */
  proxyURL?: string;

  /**
   * A name or keyword which indicates where to display the document that is returned from the proxy.
   * By default, the value is `_self`.
   * To display the document in a new window or an iframe, the proxy has to set the `"Content-Disposition"`
   * header to `inline; filename="<fileName.ext>"`.
   */
  proxyTarget?: string;

  /**
   * A key/value dictionary of `form` values that will be sent to the proxy.
   * Can be used to submit anti-forgery tokens and other metadata.
   */
  proxyData?: { [key: string]: string };
}

/**
 * Prompts the user to save a file with a specified name and content.
 *
 * The `saveAs` function is designed to work with [Data URIs]() and [Blobs](https://developer.mozilla.org/en-US/docs/Web/API/Blob) and save them as files on the client machine.
 * Under the hood, `saveAs` either creates a link that is clicked or a form that is submitted to the proxy end point if a proxy is used.
 *
 * > Saving a Blob with a proxy is not supported and will result in an error.
 *
 * > To download files from a server endpoint, use the regular HTML5 `download` attribute on an `anchor` tag to
 * [trigger the download](https://stackoverflow.com/questions/11620698/how-to-trigger-a-file-download-when-clicking-an-html-button-or-javascript/18678698#18678698).
 *
 * @param {string | Blob} data - The content of the file as a Base64-encoded [Data URI](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs) or a [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
 * @param {string} fileName - The desired file name.
 * @param {SaveOptions} options - An optional proxy configuration to use during the file-saving operation.
 *
 */
export function saveAs(data: string | Blob, fileName: string, options?: SaveOptions): void;
