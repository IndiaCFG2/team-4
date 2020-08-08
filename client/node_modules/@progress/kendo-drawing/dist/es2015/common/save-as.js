// XXX: the following will not work with IE9 (requires server proxy).
export default function saveAs(options) {
    const { dataURI, fileName } = options;
    let data = dataURI;

    if (typeof data == "string" && window.Blob) {
        const parts = data.split(";base64,");
        const contentType = parts[0];
        const base64 = atob(parts[1]);
        const array = new Uint8Array(base64.length);
        for (let idx = 0; idx < base64.length; idx++) {
            array[idx] = base64.charCodeAt(idx);
        }
        data = new Blob([ array.buffer ], { type: contentType });
    }
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(data, fileName);
    } else {
        const link = document.createElement("a");
        link.download = fileName;
        data = link.href = URL.createObjectURL(data);
        const e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, false, window,
                         0, 0, 0, 0, 0, false, false, false, false, 0, null);
        link.dispatchEvent(e);
        setTimeout(function() {
            URL.revokeObjectURL(data);
        });
    }
}