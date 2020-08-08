import { deflate as pakoDeflate } from '@progress/pako-esm';

export const deflate = pakoDeflate;

export function supportsDeflate() {
    return true;
}

