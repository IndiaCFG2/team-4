import { TreeListPDFExportProps } from './TreeListPDFExport';
/**
 * @hidden
 */
export declare function provideSaveTreeListPDF(savePDF: (domElement: HTMLElement, options?: TreeListPDFExportProps, callback?: () => void) => void): (treeList: any, pdfExportOptions?: TreeListPDFExportProps, callback?: () => void, data?: any, columns?: any) => void;
