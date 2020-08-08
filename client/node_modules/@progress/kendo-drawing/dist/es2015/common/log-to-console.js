/* eslint-disable no-console */

export default function logToConsole(message) {
    const console = window.console;

    if (typeof(console) != "undefined" && console.log) {
        console.log(message);
    }
}