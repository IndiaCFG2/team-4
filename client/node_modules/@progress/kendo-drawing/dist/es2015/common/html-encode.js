const ampRegExp = /&/g;
const ltRegExp = /</g;
const quoteRegExp = /"/g;
const aposRegExp = /'/g;
const gtRegExp = />/g;

export default function htmlEncode(value) {
    return String(value).replace(ampRegExp, "&amp;").replace(ltRegExp, "&lt;").replace(gtRegExp, "&gt;").replace(quoteRegExp, "&quot;").replace(aposRegExp, "&#39;");
}