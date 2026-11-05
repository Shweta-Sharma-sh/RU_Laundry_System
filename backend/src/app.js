// app.js
// ------
// Builds the Express app: settings, then the routes of each area.
//
//   /api/auth/...     login, logout, who am I
//   /api/student/...  the student portal   (students only)
//   /api/worker/...   the worker app       (workers only)
//   /api/admin/...    the admin dashboard  (admins only)

import express from "express";
import cors from "cors";
import { FRONTEND_URL } from "./config.js";
import { handleErrors } from "./errors.js";
import { expireOldRequests } from "./expire.js";
import authRoutes from "./routes/auth.js";

const app = express();

// Let the frontend (another address) call this API.
app.use(cors({ origin: FRONTEND_URL }));

// Read JSON request bodies. The limit is big enough for one photo.
app.use(express.json({ limit: "8mb" }));

// A quick "is the server alive?" check.
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Before every request: mark QR codes that ran out of time as expired.
app.use("/api", async (req, res, next) => {
  await expireOldRequests();
  next();
});

app.use("/api/auth", authRoutes);

// Any other address.
app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Must be last: turns errors into { error: "message" } answers.
app.use(handleErrors);

export default app;
