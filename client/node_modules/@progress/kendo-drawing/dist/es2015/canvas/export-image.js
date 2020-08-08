import Surface from './surface';
import { transform } from '../geometry';
import Group from '../shapes/group';

export default function exportImage(group, options) {
    const defaults = {
        width: "800px", height: "600px",
        cors: "Anonymous"
    };

    let exportRoot = group;
    const bbox = group.clippedBBox();


    if (bbox) {
        const origin = bbox.getOrigin();
        exportRoot = new Group();
        exportRoot.transform(transform().translate(-origin.x, -origin.y));
        exportRoot.children.push(group);

        const size = bbox.getSize();
        defaults.width = size.width + "px";
        defaults.height = size.height + "px";
    }

    const surfaceOptions = Object.assign(defaults, options);

    const container = document.createElement("div");
    const style = container.style;

    style.display = "none";
    style.width = surfaceOptions.width;
    style.height = surfaceOptions.height;
    document.body.appendChild(container);

    const surface = new Surface(container, surfaceOptions);
    surface.suspendTracking();
    surface.draw(exportRoot);

    const promise = surface.image();
    const destroy = () => {
        surface.destroy();
        document.body.removeChild(container);
    };
    promise.then(destroy, destroy);

    return promise;
}