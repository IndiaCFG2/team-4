// To list new API calls to the File Saver documentation, manually add them to `kendo-file-saver/docs/api`.
// Due to the specifics of the component and unlike the other Kendo UI components for Angular,
// the API documentation of the File Server is not generated from the `src` files.

/**
 * Encodes the provided string as Base64-encoded data.
 *
 * @param {string} plainText - The plain text to encode. Might contain UTF-8 symbols.
 * @returns {string} - The Base64-encoded string.
 *
 */
export function encodeBase64(plainText: string): string;
