// time.js
// -------
// Small date helpers. Every "today" and "what time is it" is worked out in the
// counter's time zone (TIMEZONE in .env), not in the server's time zone.

import { TIMEZONE } from "./config.js";

/** A date in the counter's time zone as "2026-11-02". */
export function localDate(value = new Date()) {
  // The "en-CA" locale writes dates as YYYY-MM-DD.
  return new Date(value).toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/** The time in the counter's time zone as "08:30". */
export function localTime(value = new Date()) {
  return new Date(value).toLocaleTimeString("en-GB", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** The day name in the counter's time zone, e.g. "Monday". */
export function localDay(value = new Date()) {
  return new Date(value).toLocaleDateString("en-US", { timeZone: TIMEZONE, weekday: "long" });
}

/** Now plus some minutes, as a Date. */
export function minutesFromNow(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/** A short unique id, e.g. "give-k3j9x2a1b4". */
export function makeId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
}
