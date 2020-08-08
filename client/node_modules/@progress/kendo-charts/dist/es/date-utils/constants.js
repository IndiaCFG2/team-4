export var MILLISECONDS = "milliseconds";
export var SECONDS = "seconds";
export var MINUTES = "minutes";
export var HOURS = "hours";
export var DAYS = "days";
export var WEEKS = "weeks";
export var MONTHS = "months";
export var YEARS = "years";

export var TIME_PER_MILLISECOND = 1;
export var TIME_PER_SECOND = 1000;
export var TIME_PER_MINUTE = 60 * TIME_PER_SECOND;
export var TIME_PER_HOUR = 60 * TIME_PER_MINUTE;
export var TIME_PER_DAY = 24 * TIME_PER_HOUR;
export var TIME_PER_WEEK = 7 * TIME_PER_DAY;
export var TIME_PER_MONTH = 31 * TIME_PER_DAY;
export var TIME_PER_YEAR = 365 * TIME_PER_DAY;
export var TIME_PER_UNIT = {
    "years": TIME_PER_YEAR,
    "months": TIME_PER_MONTH,
    "weeks": TIME_PER_WEEK,
    "days": TIME_PER_DAY,
    "hours": TIME_PER_HOUR,
    "minutes": TIME_PER_MINUTE,
    "seconds": TIME_PER_SECOND,
    "milliseconds": TIME_PER_MILLISECOND
};

