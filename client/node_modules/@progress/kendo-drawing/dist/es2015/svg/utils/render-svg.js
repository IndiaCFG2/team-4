import { SVG_NS } from '../constants';

let renderSVG = function(container, svg) {
    container.innerHTML = svg;
};

if (typeof document !== "undefined") {
    const testFragment = "<svg xmlns='" + SVG_NS + "'></svg>";
    const testContainer = document.createElement("div");
    const hasParser = typeof DOMParser !== "undefined";

    testContainer.innerHTML = testFragment;

    if (hasParser && testContainer.firstChild.namespaceURI !== SVG_NS) {
        renderSVG = function(container, svg) {
            const parser = new DOMParser();
            const chartDoc = parser.parseFromString(svg, "text/xml");
            const importedDoc = document.adoptNode(chartDoc.documentElement);

            container.innerHTML = "";
            container.appendChild(importedDoc);
        };
    }
}

export default renderSVG;