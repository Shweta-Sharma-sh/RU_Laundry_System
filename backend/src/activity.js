// activity.js
// -----------
// Writing to the activity history and sending notifications to students.

import { query } from "./db.js";

/**
 * Adds one line to the activity history. Nothing is ever deleted from it.
 *
 * event = { action, actorName, actorRole, studentId, studentName, bagNumber,
 *           fromStatus, toStatus, reason, result, kind, refType, refId }
 * (fromStatus, toStatus, reason, refType and refId can be left out)
 */
export async function logActivity(event) {
  await query(
    `INSERT INTO activity (action, actor_name, actor_role, student_id, student_name, bag_number,
       from_status, to_status, reason, result, kind, ref_type, ref_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      event.action,
      event.actorName,
      event.actorRole,
      event.studentId,
      event.studentName,
      event.bagNumber,
      event.fromStatus || null,
      event.toStatus || null,
      event.reason || null,
      event.result,
      event.kind,
      event.refType || null,
      event.refId || null,
    ],
  );
}

/** Puts a message in one student's notification bell. */
export async function notifyStudent(studentId, title, body, link) {
  await query(
    "INSERT INTO notifications (student_id, title, body, link) VALUES ($1, $2, $3, $4)",
    [studentId, title, body, link],
  );
}

/** Puts the same message in every student's bell (when the counter opens or closes). */
export async function notifyAllStudents(title, body, link) {
  const students = await query("SELECT id FROM users WHERE role = 'STUDENT'");
  for (const student of students) {
    await notifyStudent(student.id, title, body, link);
  }
}
