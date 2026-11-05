// filters.js
// ----------
// The search boxes and filters of the list screens.
//
// To keep the SQL simple, the list routes load the rows with a plain
// "SELECT ... ORDER BY" and these helpers do the filtering in JavaScript.
// This is fast enough for one university counter (tens of thousands of rows).

import { localDate } from "./time.js";

/** Keeps rows where any of the fields contains the search text (ignores case). */
export function bySearch(rows, search, fields) {
  const text = String(search ?? "").trim().toLowerCase();
  if (!text) return rows;
  return rows.filter((row) =>
    fields.some((field) => String(row[field] ?? "").toLowerCase().includes(text)),
  );
}

/** Keeps rows where row[field] equals the value. "all" or empty means no filter. */
export function byValue(rows, field, value) {
  if (!value || value === "all") return rows;
  return rows.filter((row) => row[field] === value);
}

/**
 * Keeps rows between two dates like "2026-11-01" and "2026-11-30" (both included).
 * The dates are compared in the counter's time zone.
 */
export function byDate(rows, field, dateFrom, dateTo) {
  return rows.filter((row) => {
    if (!row[field]) return false;
    const day = localDate(row[field]);
    if (dateFrom && day < dateFrom) return false;
    if (dateTo && day > dateTo) return false;
    return true;
  });
}

/** Sorts by a date field. sort = "oldest" or anything else for newest first. */
export function byDateOrder(rows, field, sort) {
  return [...rows].sort((a, b) => {
    const difference = new Date(a[field]) - new Date(b[field]);
    return sort === "oldest" ? difference : -difference;
  });
}
