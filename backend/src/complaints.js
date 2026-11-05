// complaints.js
// -------------
// Reading complaints together with all of their replies ("updates").

import { query, queryOne } from "./db.js";

export const CATEGORY_LABELS = {
  MISSING_CLOTHES: "Missing clothes",
  DAMAGED_CLOTHES: "Damaged clothes",
  INCORRECT_QUANTITY: "Incorrect quantity",
  WRONG_BAG: "Wrong bag received",
  DELAY: "Delay in returning clothes",
  OTHER: "Other",
};

export const COMPLAINT_STATUSES = ["SUBMITTED", "IN_REVIEW", "IN_PROGRESS", "RESOLVED"];

/** Adds the `updates` list to each complaint. */
export async function addUpdates(complaints) {
  const updates = await query("SELECT * FROM complaint_updates ORDER BY at");
  return complaints.map((complaint) => ({
    ...complaint,
    updates: updates.filter((u) => u.complaintRef === complaint.ref),
  }));
}

/** One complaint with its updates, or null. */
export async function findComplaint(ref) {
  const complaint = await queryOne("SELECT * FROM complaints WHERE ref = $1", [ref]);
  if (!complaint) return null;
  complaint.updates = await query(
    "SELECT * FROM complaint_updates WHERE complaint_ref = $1 ORDER BY at",
    [ref],
  );
  return complaint;
}
