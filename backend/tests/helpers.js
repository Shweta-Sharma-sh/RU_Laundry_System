// tests/helpers.js
// ----------------
// Small helpers for the tests: start the API on a free port, sign in, and call it.
// The tests use the database in TEST_DATABASE_URL (see package.json), never the real one.

import app from "../src/app.js";
import { resetDatabase } from "../database/reset.js";

let server;
let baseUrl;

/** Fresh demo data + a running server. Call it in before(). */
export async function startApi() {
  await resetDatabase();
  server = app.listen(0); // 0 = any free port
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://localhost:${server.address().port}/api`;
}

export async function stopApi() {
  await new Promise((resolve) => server.close(resolve));
}

/** Calls the API. Returns { status, body }. */
export async function call(token, method, path, body) {
  const response = await fetch(baseUrl + path, {
    method: method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

/** Signs in and returns the token. */
export async function signIn(portal, identifier, password) {
  const answer = await call("", "POST", "/auth/login", { portal, identifier, password });
  return answer.body.token;
}
