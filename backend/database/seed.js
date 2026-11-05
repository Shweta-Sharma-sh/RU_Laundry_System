// seed.js
// -------
// The demo data: the same students, workers and admin as the frontend demo.
//
//   Student  RU2026CS001 ... RU2026CE008   password  ru@2026
//   Worker   W-001, W-002                  password  worker@ru
//   Admin    admin                         password  admin@ru

import bcrypt from "bcryptjs";
import { query } from "../src/db.js";

const STUDENTS = [
  ["RU2026CS001", "Aarav Sharma", "B-001"],
  ["RU2026CS002", "Ananya Verma", "B-002"],
  ["RU2026CS003", "Ishaan Kumar", "B-003"],
  ["RU2026EC004", "Diya Nair", "B-004"],
  ["RU2026EC005", "Kabir Singh", "B-005"],
  ["RU2026ME006", "Meera Iyer", "B-006"],
  ["RU2026ME007", "Rohan Gupta", "B-007"],
  ["RU2026CE008", "Sara Khan", "B-008"],
];

const WORKERS = [
  ["W-001", "Ramesh Yadav"],
  ["W-002", "Sunita Devi"],
];

const SCHEDULE = [
  ["Monday", 1, true, "08:00", "19:00"],
  ["Tuesday", 2, true, "08:00", "19:00"],
  ["Wednesday", 3, true, "08:00", "19:00"],
  ["Thursday", 4, true, "08:00", "19:00"],
  ["Friday", 5, true, "08:00", "19:00"],
  ["Saturday", 6, true, "09:00", "17:00"],
  ["Sunday", 7, false, "09:00", "17:00"],
];

export async function seed() {
  const studentPassword = await bcrypt.hash("ru@2026", 10);
  const workerPassword = await bcrypt.hash("worker@ru", 10);
  const adminPassword = await bcrypt.hash("admin@ru", 10);

  for (const [id, name, bagNumber] of STUDENTS) {
    await query("INSERT INTO users (id, role, name, password_hash) VALUES ($1, 'STUDENT', $2, $3)", [
      id,
      name,
      studentPassword,
    ]);
    await query("INSERT INTO bags (bag_number, student_id) VALUES ($1, $2)", [bagNumber, id]);
  }

  for (const [id, name] of WORKERS) {
    await query("INSERT INTO users (id, role, name, password_hash) VALUES ($1, 'WORKER', $2, $3)", [
      id,
      name,
      workerPassword,
    ]);
  }

  await query(
    "INSERT INTO users (id, role, name, password_hash) VALUES ('admin', 'ADMIN', 'Dr. Priya Menon', $1)",
    [adminPassword],
  );

  for (const [day, sortOrder, isOpen, openTime, closeTime] of SCHEDULE) {
    await query(
      `INSERT INTO counter_schedule (day, sort_order, is_open, open_time, close_time)
       VALUES ($1, $2, $3, $4, $5)`,
      [day, sortOrder, isOpen, openTime, closeTime],
    );
  }

  // The demo starts with the counter opened by the admin.
  await query(
    "INSERT INTO counter_state (id, manual_state, opened_at, updated_by) VALUES (1, 'OPEN', now(), 'Dr. Priya Menon')",
  );

  // Ananya's bag is being washed, Ishaan's bag is waiting at the counter.
  await query(
    `UPDATE bags SET status = 'IN_PROCESS', quantity = 6, received_at = now() - interval '5 hours',
       updated_by = 'Ramesh Yadav' WHERE bag_number = 'B-002'`,
  );
  await query(
    `UPDATE bags SET status = 'AT_COUNTER', quantity = 4, received_at = now() - interval '26 hours',
       returned_at = now() - interval '30 minutes', updated_by = 'Ramesh Yadav' WHERE bag_number = 'B-003'`,
  );
  await query(
    `INSERT INTO activity (action, actor_name, actor_role, student_id, student_name, bag_number,
       from_status, to_status, result, kind)
     VALUES ('Bag returned to counter', 'Ramesh Yadav', 'WORKER', 'RU2026CS003', 'Ishaan Kumar', 'B-003',
       'IN_PROCESS', 'AT_COUNTER', 'Ready for collection', 'BAG')`,
  );
}
