import { logToConsole } from '../drawing-utils';

var FontLoader = function FontLoader () {};

FontLoader.fetchFonts = function fetchFonts (options, fonts, state) {
        if ( state === void 0 ) state = { depth: 0 };

    var MAX_DEPTH = 5;

    if (!options || state.depth > MAX_DEPTH || !document.fonts) {
        return;
    }

    Object.keys(options).forEach(function(key) {
        var value = options[key];
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
};

FontLoader.loadFonts = function loadFonts (fonts, callback) {
    var promises = [];

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
};

FontLoader.preloadFonts = function preloadFonts (options, callback) {
    var fonts = [];
    FontLoader.fetchFonts(options, fonts);

    FontLoader.loadFonts(fonts, callback);
};

export default FontLoader;