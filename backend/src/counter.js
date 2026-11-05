// counter.js
// ----------
// Is the laundry counter open right now?
//
// The rule:
//   1. If an admin pressed OPEN COUNTER or CLOSE COUNTER, that decides it.
//   2. Otherwise the weekly schedule decides (the day must be open and the time
//      must be between the opening and closing time),
//   3. ...unless a holiday covers today, or a temporary closure covers this time.

import { query, queryOne } from "./db.js";
import { localDate, localDay, localTime } from "./time.js";

const OPEN_MESSAGE = "New laundry submissions and collections are currently available.";
const CLOSED_MESSAGE = "The counter is closed. You can still view your bag status and history.";

/**
 * Works out the counter state. It does not read the database, so it is easy to test.
 * Times like "08:00" can be compared as text because they always have 5 characters.
 */
export function computeCounterState(manualState, schedule, closures, at = new Date()) {
  if (manualState === "OPEN") return { isOpen: true, message: OPEN_MESSAGE };
  if (manualState === "CLOSED") return { isOpen: false, message: CLOSED_MESSAGE };

  const today = localDate(at);
  const time = localTime(at);
  const day = schedule.find((d) => d.day === localDay(at));

  if (!day || !day.isOpen) {
    return { isOpen: false, message: "The counter is closed today. You can still view your bag status and history." };
  }
  if (time < day.openTime || time >= day.closeTime) {
    return { isOpen: false, message: `The counter is open from ${day.openTime} to ${day.closeTime} today.` };
  }

  for (const closure of closures) {
    if (closure.date !== today) continue;
    // A holiday (or a closure without times) covers the whole day.
    if (closure.type === "HOLIDAY" || !closure.startTime || !closure.endTime) {
      return { isOpen: false, message: `The counter is closed today (${closure.reason}).` };
    }
    if (time >= closure.startTime && time < closure.endTime) {
      return {
        isOpen: false,
        message: `The counter is closed until ${closure.endTime} (${closure.reason}).`,
      };
    }
  }

  return { isOpen: true, message: OPEN_MESSAGE };
}

/** Reads everything about the counter from the database. */
export async function getCounter() {
  const state = await queryOne("SELECT * FROM counter_state WHERE id = 1");
  const schedule = await query(
    "SELECT day, is_open, open_time, close_time FROM counter_schedule ORDER BY sort_order",
  );
  const closures = await query("SELECT * FROM counter_closures ORDER BY date");

  const { isOpen, message } = computeCounterState(state.manualState, schedule, closures);

  return {
    isOpen,
    message,
    manualState: state.manualState,
    manuallyOpen: state.manualState === "OPEN",
    openedAt: state.openedAt,
    closedAt: state.closedAt,
    updatedBy: state.updatedBy,
    schedule,
    closures,
  };
}

/** The short version the student and worker dashboards show. */
export async function getCounterInfo() {
  const counter = await getCounter();
  return {
    isOpen: counter.isOpen,
    message: counter.message,
    schedule: counter.schedule,
    closures: counter.closures,
  };
}
