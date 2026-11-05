// tests/qr-and-counter.test.js
// ----------------------------
// Rules that do not need the database:
//   * a QR code cannot be faked, and an expired code is refused
//   * the counter follows the admin button, the weekly hours and the closures

import { test } from "node:test";
import assert from "node:assert";
import { createQrToken, readQrToken } from "../src/qr.js";
import { computeCounterState } from "../src/counter.js";

const request = {
  id: "give-1",
  studentId: "RU2026CS001",
  bagNumber: "B-001",
  qrExpiresAt: new Date(Date.now() + 60000),
};

test("a QR code can be read back", () => {
  const payload = readQrToken(createQrToken("give", request));
  assert.equal(payload.requestId, "give-1");
  assert.equal(payload.kind, "give");
});

test("a QR code with a changed signature is refused", () => {
  const token = createQrToken("give", request);
  assert.equal(readQrToken(token.slice(0, -2) + "xx"), null);
});

test("a QR code with changed data is refused", () => {
  const [prefix, , signature] = createQrToken("give", request).split(".");
  const fakeData = Buffer.from(JSON.stringify({ kind: "give", requestId: "someone-else" })).toString("base64url");
  assert.equal(readQrToken(`${prefix}.${fakeData}.${signature}`), null);
});

test("an expired QR code is refused", () => {
  const old = { ...request, qrExpiresAt: new Date(Date.now() - 1000) };
  assert.equal(readQrToken(createQrToken("give", old)), null);
});

test("text that is not a QR code is refused", () => {
  assert.equal(readQrToken("hello world"), null);
  assert.equal(readQrToken(""), null);
});

// Monday 2 November 2026, 11:30 in India (06:00 UTC).
const mondayMorning = new Date("2026-11-02T06:00:00Z");
// Monday 2 November 2026, 21:30 in India.
const mondayNight = new Date("2026-11-02T16:00:00Z");
const schedule = [
  { day: "Monday", isOpen: true, openTime: "08:00", closeTime: "19:00" },
  { day: "Sunday", isOpen: false, openTime: "09:00", closeTime: "17:00" },
];

test("the admin button decides first", () => {
  assert.equal(computeCounterState("OPEN", schedule, [], mondayNight).isOpen, true);
  assert.equal(computeCounterState("CLOSED", schedule, [], mondayMorning).isOpen, false);
});

test("without the button, the weekly hours decide", () => {
  assert.equal(computeCounterState(null, schedule, [], mondayMorning).isOpen, true);
  assert.equal(computeCounterState(null, schedule, [], mondayNight).isOpen, false);
  const sunday = new Date("2026-11-01T06:00:00Z");
  assert.equal(computeCounterState(null, schedule, [], sunday).isOpen, false);
});

test("a holiday closes the whole day", () => {
  const holiday = [{ type: "HOLIDAY", date: "2026-11-02", reason: "Foundation Day" }];
  assert.equal(computeCounterState(null, schedule, holiday, mondayMorning).isOpen, false);
});

test("a temporary closure only closes its hours", () => {
  const closure = [{ type: "TEMPORARY", date: "2026-11-02", startTime: "11:00", endTime: "12:00", reason: "Repair" }];
  assert.equal(computeCounterState(null, schedule, closure, mondayMorning).isOpen, false);
  const later = new Date("2026-11-02T08:00:00Z"); // 13:30 in India
  assert.equal(computeCounterState(null, schedule, closure, later).isOpen, true);
});
