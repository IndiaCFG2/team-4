import { PDFExportProps } from '../PDFExportProps';
/**
 * @hidden
 */
export declare function provideSaveGridPDF(savePDF: (domElement: HTMLElement, options?: PDFExportProps, callback?: () => void) => void): (grid: any, pdfExportOptions?: PDFExportProps, callback?: () => void, data?: any, columns?: any) => void;
