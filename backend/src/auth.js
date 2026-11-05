// auth.js
// -------
// Login, logout and "who is this?".
//
// How it works:
//   1. POST /api/auth/login checks the password and gives back a random token.
//   2. The frontend keeps the token (one per role, so a student, a worker and an
//      admin can be signed in at the same time in one browser).
//   3. Every other request sends the token back in a header:
//          Authorization: Bearer <token>
//   4. We look the token up in the sessions table to find the user.
//
// The sessions table only keeps a SHA-256 hash of the token, never the token
// itself. So even if somebody copies the database, they cannot sign in with it.

import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { query, queryOne } from "./db.js";
import { ApiError } from "./errors.js";
import { SESSION_DAYS } from "./config.js";

/** Turns a token into its SHA-256 hash (always the same hash for the same token). */
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** The user as the frontend sees it (never with the password). */
export async function publicUser(user) {
  const result = { id: user.id, role: user.role, name: user.name };

  if (user.role === "STUDENT") {
    result.studentId = user.id;
    const bag = await queryOne("SELECT bag_number FROM bags WHERE student_id = $1", [user.id]);
    if (bag) result.bagNumber = bag.bagNumber;
  }
  if (user.role === "WORKER") result.workerId = user.id;
  if (user.role === "ADMIN") result.username = user.id;

  return result;
}

/** Checks the password and creates a session. Returns { token, user }. */
export async function login(portal, identifier, password) {
  let role;
  if (portal === "student") role = "STUDENT";
  else if (portal === "worker") role = "WORKER";
  else if (portal === "admin") role = "ADMIN";
  else throw new ApiError(400, "Unknown portal.");

  const user = await queryOne(
    "SELECT * FROM users WHERE LOWER(id) = LOWER($1) AND role = $2",
    [String(identifier || "").trim(), role],
  );

  let passwordIsRight = false;
  if (user) passwordIsRight = await bcrypt.compare(String(password || ""), user.passwordHash);

  if (!passwordIsRight) {
    if (role === "STUDENT") throw new ApiError(401, "Incorrect Student ID or password. Please try again.");
    if (role === "WORKER") throw new ApiError(401, "Incorrect Worker ID or password. Please try again.");
    throw new ApiError(401, "Incorrect username or password. Please try again.");
  }

  // A long random text that nobody can guess.
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await query("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)", [
    hashToken(token),
    user.id,
    expiresAt,
  ]);

  return { token, user: await publicUser(user) };
}

/** Reads the token from the "Authorization: Bearer ..." header. */
function getToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

/** Finds the signed in user, or null. */
export async function getUserFromRequest(req) {
  const token = getToken(req);
  if (!token) return null;
  return queryOne(
    `SELECT users.* FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token_hash = $1 AND sessions.expires_at > now()`,
    [hashToken(token)],
  );
}

export async function logout(req) {
  const token = getToken(req);
  if (token) await query("DELETE FROM sessions WHERE token_hash = $1", [hashToken(token)]);
}

/**
 * Middleware that only lets a signed in user with this role through.
 * Example:  router.use(requireRole("STUDENT"));
 * After it runs, the routes can read the user from req.user.
 */
export function requireRole(role) {
  return async function (req, res, next) {
    const user = await getUserFromRequest(req);
    if (!user) throw new ApiError(401, "Please sign in again.");
    if (user.role !== role) throw new ApiError(403, "You are not allowed to do this.");
    req.user = user;
    next();
  };
}
