export const MILLISECONDS = "milliseconds";
export const SECONDS = "seconds";
export const MINUTES = "minutes";
export const HOURS = "hours";
export const DAYS = "days";
export const WEEKS = "weeks";
export const MONTHS = "months";
export const YEARS = "years";

export const TIME_PER_MILLISECOND = 1;
export const TIME_PER_SECOND = 1000;
export const TIME_PER_MINUTE = 60 * TIME_PER_SECOND;
export const TIME_PER_HOUR = 60 * TIME_PER_MINUTE;
export const TIME_PER_DAY = 24 * TIME_PER_HOUR;
export const TIME_PER_WEEK = 7 * TIME_PER_DAY;
export const TIME_PER_MONTH = 31 * TIME_PER_DAY;
export const TIME_PER_YEAR = 365 * TIME_PER_DAY;
export const TIME_PER_UNIT = {
    "years": TIME_PER_YEAR,
    "months": TIME_PER_MONTH,
    "weeks": TIME_PER_WEEK,
    "days": TIME_PER_DAY,
    "hours": TIME_PER_HOUR,
    "minutes": TIME_PER_MINUTE,
    "seconds": TIME_PER_SECOND,
    "milliseconds": TIME_PER_MILLISECOND
};

