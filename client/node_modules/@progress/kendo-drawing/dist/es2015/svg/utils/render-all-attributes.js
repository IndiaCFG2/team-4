import renderAttr from './render-attribute';

export default function renderAllAttr(attrs) {
    let output = "";
    for (let i = 0; i < attrs.length; i++) {
        output += renderAttr(attrs[i][0], attrs[i][1]);
    }

    return output;
}