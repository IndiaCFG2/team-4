/**
 * Represents the props of a page template component that can be added to the PDFExport component.
 */
export interface PageTemplateProps {
    /**
     * The number of the current page.
     */
    pageNum: number;
    /**
     * The total number of pages.
     */
    totalPages: number;
}
