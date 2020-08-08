const COORDINATE_LIMIT = 300000;

const DateLabelFormats = {
    milliseconds: "HH:mm:ss.fff",
    seconds: "HH:mm:ss",
    minutes: "HH:mm",
    hours: "HH:mm",
    days: "M/d",
    weeks: "M/d",
    months: "MMM 'yy",
    years: "yyyy"
};

const ZERO_THRESHOLD = 0.2;

export {
    COORDINATE_LIMIT, DateLabelFormats, ZERO_THRESHOLD
};