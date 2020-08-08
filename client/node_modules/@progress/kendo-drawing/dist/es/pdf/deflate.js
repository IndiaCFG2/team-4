import { deflate as pakoDeflate } from '@progress/pako-esm';

export var deflate = pakoDeflate;

export function supportsDeflate() {
    return true;
}

