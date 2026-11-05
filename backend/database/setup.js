// setup.js
// --------
// Creates all the tables and loads the demo data.
//
//   npm run db:setup
//
// WARNING: this deletes everything that is in the database first.

import { closeDb } from "../src/db.js";
import { resetDatabase } from "./reset.js";

await resetDatabase();
console.log("Database is ready with the demo data.");
await closeDb();
