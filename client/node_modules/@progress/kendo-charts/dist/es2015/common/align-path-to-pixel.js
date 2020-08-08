import { drawing } from '@progress/kendo-drawing';

export default function alignPathToPixel(path) {
    let offset = 0.5;
    if (path.options.stroke && drawing.util.defined(path.options.stroke.width)) {
        if (path.options.stroke.width % 2 === 0) {
            offset = 0;
        }
    }

    for (let i = 0; i < path.segments.length; i++) {
        path.segments[i].anchor().round(0).translate(offset, offset);
    }

    return path;
}