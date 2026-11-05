// reset.js
// --------
// Deletes all tables, creates them again from schema.sql and loads the demo data.
// Used by "npm run db:setup", the tests, and the admin "reset demo" button.

import fs from "node:fs";
import { runSqlScript } from "../src/db.js";
import { seed } from "./seed.js";

export async function resetDatabase() {
  const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
  await runSqlScript(schema);
  await seed();
}
