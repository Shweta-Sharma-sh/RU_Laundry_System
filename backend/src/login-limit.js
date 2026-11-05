// login-limit.js
// --------------
// Stops people from guessing passwords.
//
// After LOGIN_MAX_TRIES wrong passwords for the same ID, that ID is locked for
// LOGIN_LOCK_MINUTES. A correct password clears the count.
//
// The counts are kept in memory (a plain object), so they reset when the
// server restarts. That is fine for one server.

import { ApiError } from "./errors.js";
import { LOGIN_MAX_TRIES, LOGIN_LOCK_MINUTES } from "./config.js";

// "STUDENT:ru2026cs001" -> { wrongTries: 2, lockedUntil: 0 }
const failedLogins = {};

/** The same ID typed in any case counts as one ID. */
function keyFor(role, id) {
  return role + ":" + String(id || "").trim().toLowerCase();
}

/** Throws if this ID is locked right now. */
export function checkNotLocked(role, id) {
  const entry = failedLogins[keyFor(role, id)];
  if (entry && entry.lockedUntil > Date.now()) {
    const minutesLeft = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    throw new ApiError(429, `Too many wrong passwords. Please try again in ${minutesLeft} minute(s).`);
  }
}

/** Counts one wrong password. Locks the ID when there are too many. */
export function recordWrongPassword(role, id) {
  const key = keyFor(role, id);
  if (!failedLogins[key]) failedLogins[key] = { wrongTries: 0, lockedUntil: 0 };

  const entry = failedLogins[key];
  entry.wrongTries += 1;
  if (entry.wrongTries >= LOGIN_MAX_TRIES) {
    entry.lockedUntil = Date.now() + LOGIN_LOCK_MINUTES * 60000;
    entry.wrongTries = 0;
  }
}

/** A correct password: forget the wrong tries. */
export function clearWrongPasswords(role, id) {
  delete failedLogins[keyFor(role, id)];
}
