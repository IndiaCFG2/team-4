import { logToConsole } from '../drawing-utils';

class FontLoader {
    static fetchFonts(options, fonts, state = { depth: 0 }) {
        const MAX_DEPTH = 5;

        if (!options || state.depth > MAX_DEPTH || !document.fonts) {
            return;
        }

        Object.keys(options).forEach(function(key) {
            const value = options[key];
            if (key === "dataSource" || key[0] === "$" || !value) {
                return;
            }

            if (key === "font") {
                fonts.push(value);
            } else if (typeof value === "object") {
                state.depth++;
                FontLoader.fetchFonts(value, fonts, state);
                state.depth--;
            }
        });
    }

    static loadFonts(fonts, callback) {
        let promises = [];

        if (fonts.length > 0 && document.fonts) {
            try {
                promises = fonts.map(function(font) {
                    return document.fonts.load(font);
                });
            } catch (e) {
                // Silence font-loading errors
                logToConsole(e);
            }

            Promise.all(promises).then(callback, callback);
        } else {
            callback();
        }
    }

    static preloadFonts(options, callback) {
        const fonts = [];
        FontLoader.fetchFonts(options, fonts);

        FontLoader.loadFonts(fonts, callback);
    }
}

export default FontLoader;