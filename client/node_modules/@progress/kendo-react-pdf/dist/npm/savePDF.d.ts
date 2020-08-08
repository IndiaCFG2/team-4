import { PDFExportProps } from './PDFExportProps';
/**
 * Saves the content of a DOM element to a PDF file.
 *
 * @param domElement - The root DOM element to save to a PDF file.
 * @param options - The export options.
 * @param callback - The callback to be executed after the PDF is saved.
 */
export declare function savePDF(domElement: HTMLElement, options?: PDFExportProps, callback?: () => void): void;
