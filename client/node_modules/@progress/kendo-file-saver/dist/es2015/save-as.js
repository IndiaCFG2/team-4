export function saveAs(data, fileName, options = {}) {
  let save = postToProxy;

  if (options.forceProxy && !options.proxyURL) {
    throw new Error('No proxyURL is set, but forceProxy is true');
  }

  if (!options.forceProxy) {
    if (canDownload()) {
      save = saveAsDataURI;
    }

    if (navigator.msSaveBlob) {
      save = saveAsBlob;
    }
  }

  save(data, fileName, options);
}

const anchor = () => document.createElement('a');
const canDownload = () => 'download' in anchor();

function saveAsBlob(data, fileName) {
  let blob = data; // could be a Blob object

  if (typeof data === 'string') {
    const parts = data.split(';base64,');
    const contentType = parts[0];
    const base64 = atob(parts[1]);
    const array = new Uint8Array(base64.length);

    for (let idx = 0; idx < base64.length; idx++) {
      array[idx] = base64.charCodeAt(idx);
    }

    blob = new Blob([ array.buffer ], { type: contentType });
  }

  navigator.msSaveBlob(blob, fileName);
}

function saveAsDataURI(data, fileName) {
  let dataURI = data;
  if (window.Blob && data instanceof Blob) {
    dataURI = URL.createObjectURL(data);
  }

  const fileSaver = anchor();
  fileSaver.download = fileName;
  fileSaver.href = dataURI;

  const e = document.createEvent('MouseEvents');
  e.initMouseEvent('click', true, false, window,
  0, 0, 0, 0, 0, false, false, false, false, 0, null);

  fileSaver.dispatchEvent(e);
  setTimeout(() => URL.revokeObjectURL(dataURI));
}

function postToProxy(dataURI, fileName, options) {
  if (!options.proxyURL) {
    return;
  }

  const form = document.createElement('form');
  form.setAttribute('action', options.proxyURL);
  form.setAttribute('method', 'POST');
  form.setAttribute('target', options.proxyTarget || '_self');

  const formData = options.proxyData || {};
  formData.fileName = fileName;

  const parts = dataURI.split(";base64,");
  formData.contentType = parts[0].replace("data:", "");
  formData.base64 = parts[1];

  for (let name in formData) {
    if (formData.hasOwnProperty(name)) {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', name);
      input.setAttribute('value', formData[name]);

      form.appendChild(input);
    }
  }

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

