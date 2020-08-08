/**
 * @hidden
 */
export interface NumericTextBoxState {
    eventValue: number | null | undefined;
    prevLooseValue: string | undefined;
    currentLooseValue: string | undefined;
    selectionStart: number | undefined;
    selectionEnd: number | undefined;
    decimalSelect: boolean;
    valueIsCorrected: boolean;
    valueIsOutOfRange: boolean;
    focused: boolean;
    isPaste: boolean;
}
