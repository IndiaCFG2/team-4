/**
 * @hidden
 */
export declare const HEADER_CLASS: string;
/**
 * @hidden
 */
export declare const FOOTER_CLASS: string;
/**
 * @hidden
 */
export declare class GridQuery {
    private element;
    private headerWrap;
    private list;
    private footerWrap;
    constructor(element: HTMLElement);
    content(): Element;
    header(): Element;
    footer(): Element;
    table(): Node;
}
