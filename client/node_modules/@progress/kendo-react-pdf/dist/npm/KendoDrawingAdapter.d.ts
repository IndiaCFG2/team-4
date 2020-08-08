import { DrawOptions, Group } from '@progress/kendo-drawing';
import { PDFOptions } from '@progress/kendo-drawing/pdf';
import { SaveOptions } from '@progress/kendo-file-saver';
import { PDFExportProps } from './PDFExportProps';
/**
 * @hidden
 */
export default class KendoDrawingAdapter {
    private drawDOM;
    private exportPDF;
    private saveAs;
    private domElement;
    private options;
    constructor(drawDOM: (element: HTMLElement, options: DrawOptions) => Promise<Group>, exportPDF: (group: Group, options: PDFOptions) => Promise<string>, saveAs: (dataUri: string, fileName: string, options: SaveOptions) => void, domElement: HTMLElement, options?: PDFExportProps);
    savePDF(callback?: () => void): void;
    private getDrawOptions;
    private getPDFOptions;
    private getSaveOptions;
    private convertPageTemplateToHtml;
}
