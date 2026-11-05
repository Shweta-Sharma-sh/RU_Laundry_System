// bags.js
// -------
// Reading bags. A bag always comes back with the student's name attached,
// because every screen that shows a bag also shows whose bag it is.

import { query, queryOne } from "./db.js";

/** The bag of one student, or null. */
export function findBagOfStudent(studentId) {
  return queryOne(
    `SELECT bags.*, users.name AS student_name
     FROM bags JOIN users ON users.id = bags.student_id
     WHERE bags.student_id = $1`,
    [studentId],
  );
}

/** A bag by its number ("B-001"), or null. */
export function findBagByNumber(bagNumber) {
  return queryOne(
    `SELECT bags.*, users.name AS student_name
     FROM bags JOIN users ON users.id = bags.student_id
     WHERE bags.bag_number = $1`,
    [bagNumber],
  );
}

/** Every bag. */
export function getAllBags() {
  return query(
    `SELECT bags.*, users.name AS student_name
     FROM bags JOIN users ON users.id = bags.student_id
     ORDER BY bags.bag_number`,
  );
}
